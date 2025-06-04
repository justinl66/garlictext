const db = require("../models");
const { Op } = require("sequelize");
const Game = db.Game;
const User = db.User;
const Caption = db.Caption;
const Image = db.Image;

exports.getGameResults = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    if (!gameId) {
      return res.status(400).send({
        message: "Game ID is required"
      });
    }    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] },
          attributes: ['id', 'username', 'profilePictureUrl']
        }
      ]
    });

    if (!game) {
      return res.status(404).send({
        message: `Game with ID ${gameId} not found.`
      });    }

    const images = await Image.findAll({
      where: { roundId: gameId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profilePictureUrl']
        },
        {
          model: Caption,
          as: 'captions',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'profilePictureUrl']
            }
          ]
        }
      ],
      order: [['votes', 'DESC']]    });

    const playerVotesMap = new Map();
    game.participants.forEach(participant => {
      playerVotesMap.set(participant.id, {
        id: participant.id,
        username: participant.username,
        profilePictureUrl: participant.profilePictureUrl,
        totalVotes: 0
      });    });
    
    images.forEach(image => {
      const creatorId = image.userId;
      if (playerVotesMap.has(creatorId)) {
        const playerData = playerVotesMap.get(creatorId);
        playerData.totalVotes += image.votes || 0;
        playerVotesMap.set(creatorId, playerData);
      }    });
    
    for (const image of images) {
      if (image.captions && image.captions.length > 0) {
        for (const caption of image.captions) {
          const captionCreatorId = caption.userId;
          if (playerVotesMap.has(captionCreatorId)) {
            const playerData = playerVotesMap.get(captionCreatorId);
            playerData.totalVotes += caption.votes || 0;
            playerVotesMap.set(captionCreatorId, playerData);
          }
        }
      }    }
    
    const players = Array.from(playerVotesMap.values())      .sort((a, b) => b.totalVotes - a.totalVotes);

    const topDrawings = images.slice(0, 5).map(image => {
      const topCaption = image.captions && image.captions.length > 0
        ? image.captions.sort((a, b) => b.votes - a.votes)[0]
        : null;
      
      return {
        drawingId: image.id,
        imageUrl: null,
        enhancedImageUrl: null,
        votes: image.votes || 0,
        creator: {
          id: image.user.id,
          username: image.user.username
        },
        caption: topCaption ? {
          id: topCaption.id,
          text: topCaption.text,
          creator: {
            id: topCaption.user.id,
            username: topCaption.user.username
          }
        } : null
      };    });
    const totalGameVotes = players.reduce((sum, player) => sum + player.totalVotes, 0);
    let goldVotes = players.length > 0 ? players[0].totalVotes : 0;
    let silverVotes = null;
    let bronzeVotes = null;
    
    players.forEach(player => {
      if (player.totalVotes === 0) {
        player.medal = null;
        return;
      }
      
      if (player.totalVotes === goldVotes) {
        player.medal = 'gold';
      } else if (silverVotes === null) {
        silverVotes = player.totalVotes;
        player.medal = 'silver';
      } else if (player.totalVotes === silverVotes) {
        player.medal = 'silver';
      } else if (bronzeVotes === null) {
        bronzeVotes = player.totalVotes;
        player.medal = 'bronze';
      } else if (player.totalVotes === bronzeVotes) {
        player.medal = 'bronze';
      } else {
        player.medal = null;
      }
      
      player.votePercentage = totalGameVotes > 0 ?
        Math.round((player.totalVotes / totalGameVotes) * 100) : 0;
    });

    let currentRank = 1;
    let prevVotes = -1;
    let sameRankCount = 0;
    
    const leaderboard = players.map((player, index) => {
      const playerImages = images.filter(image => image.userId === player.id);
      const bestPlayerImage = playerImages.length > 0 
        ? playerImages.sort((a, b) => b.votes - a.votes)[0] 
        : null;
      
      let bestSubmission = null;
      
      if (bestPlayerImage) {
        const topCaption = bestPlayerImage.captions && bestPlayerImage.captions.length > 0
          ? bestPlayerImage.captions.sort((a, b) => b.votes - a.votes)[0]
          : null;
          
        bestSubmission = {
          type: 'drawing',
          imageId: bestPlayerImage.id,
          imageUrl: null,
          enhancedImageUrl: null,
          votes: bestPlayerImage.votes || 0,
          captionId: topCaption ? topCaption.id : null,
          captionText: topCaption ? topCaption.text : null,
          captionCreator: topCaption ? {
            id: topCaption.user.id,
            username: topCaption.user.username
          } : null
        };
      }

      if (index === 0) {
        prevVotes = player.totalVotes;
        return {
          userId: player.id,
          username: player.username,
          profilePictureUrl: player.profilePictureUrl,
          totalVotes: player.totalVotes,
          drawingVotes: bestSubmission ? bestSubmission.votes : 0,
          votePercentage: player.votePercentage,
          bestSubmission,
          bestVotes: bestSubmission ? bestSubmission.votes : 0,
          medal: player.medal,
          rank: currentRank
        };
      }
        
      if (player.totalVotes < prevVotes) {
        currentRank += sameRankCount + 1;
        sameRankCount = 0;
      } else {
        sameRankCount++;
      }
      
      prevVotes = player.totalVotes;
      return {
        userId: player.id,
        username: player.username,
        profilePictureUrl: player.profilePictureUrl,
        totalVotes: player.totalVotes,
        drawingVotes: bestSubmission ? bestSubmission.votes : 0,
        votePercentage: player.votePercentage,
        bestSubmission,
        bestVotes: bestSubmission ? bestSubmission.votes : 0,
        medal: player.medal,
        rank: currentRank
      };
    });     
    const topDrawingsFormatted = topDrawings.map(drawing => ({
      drawingId: drawing.drawingId,
      imageUrl: null, 
      enhancedImageUrl: null,
      votes: drawing.votes,
      votePercentage: totalGameVotes > 0 ? Math.round((drawing.votes / totalGameVotes) * 100) : 0,
      creator: drawing.creator,
      caption: drawing.caption
    }));
      
    res.send({
      gameId: gameId,
      gameCode: game.id,
      title: game.name || 'Garlic Text Game',
      totalVotes: totalGameVotes,
      topDrawings: topDrawingsFormatted,
      leaderboard
    });
    
  } catch (err) {
    console.error("Error in getGameResults:", err);
    res.status(500).send({
      message: err.message || "Error retrieving game results"
    });
  }
};
