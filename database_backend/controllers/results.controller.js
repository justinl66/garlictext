const db = require("../models");
const { Op } = require("sequelize");
const Game = db.Game;
const User = db.User;
const Caption = db.Caption;
const Image = db.Image;

// get player rankings
exports.getGameResults = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    if (!gameId) {
      return res.status(400).send({
        message: "Game ID is required"
      });
    }
    
    // TODO: query db for actual data (placeholder for now)
    const players = [
      {
        id: 1,
        username: 'user1',
        profilePictureUrl: 'https://example.com/avatar1.jpg',
        totalVotes: 8  // total votes for their drawing
      },
      {
        id: 3,
        username: 'user3',
        profilePictureUrl: 'https://example.com/avatar3.jpg',
        totalVotes: 5
      },
      {
        id: 5,
        username: 'user5',
        profilePictureUrl: 'https://example.com/avatar5.jpg',
        totalVotes: 5 // tied with user3
      },
      {
        id: 7,
        username: 'user7',
        profilePictureUrl: 'https://example.com/avatar7.jpg',
        totalVotes: 2
      },
      {
        id: 9,
        username: 'user9',
        profilePictureUrl: 'https://example.com/avatar9.jpg',
        totalVotes: 0 // no votes
      }
    ];
    
    // TODO: placeholder for images caption combinations
    const topDrawings = [
      {
        drawingId: 101,
        imageUrl: 'https://example.com/drawing1.jpg',
        enhancedImageUrl: 'https://example.com/enhanced1.jpg',
        votes: 5,
        creator: {
          id: 1,
          username: 'user1'
        },
        caption: {
          id: 201,
          text: 'Caption for the first drawing',
          creator: {
            id: 2,
            username: 'user2'
          }
        }
      },
      {
        drawingId: 102,
        imageUrl: 'https://example.com/drawing2.jpg',
        enhancedImageUrl: 'https://example.com/enhanced2.jpg',
        votes: 3,
        creator: {
          id: 3,
          username: 'user3'
        },
        caption: {
          id: 202,
          text: 'Caption for the second drawing',
          creator: {
            id: 4,
            username: 'user4'
          }
        }
      },
      {
        drawingId: 103,
        imageUrl: 'https://example.com/drawing3.jpg',
        enhancedImageUrl: 'https://example.com/enhanced3.jpg',
        votes: 3,
        creator: {
          id: 5,
          username: 'user5'
        },
        caption: {
          id: 203,
          text: 'Caption for the third drawing',
          creator: {
            id: 6,
            username: 'user6'
          }
        }
      }
    ];
    
    // calculate total votes in the game
    const totalGameVotes = players.reduce((sum, player) => sum + player.totalVotes, 0);
    
    // format players for leaderboard
    players.sort((a, b) => b.totalVotes - a.totalVotes);
    
    // medal assign based on total votes
    let goldVotes = players[0].totalVotes;
    let silverVotes = null;
    let bronzeVotes = null;
    
    players.forEach(player => {
      // skip players with no votes for medal assignment
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
      
      // calculate vote percentage
      player.votePercentage = totalGameVotes > 0 ?
        Math.round((player.totalVotes / totalGameVotes) * 100) : 0;
    });
    
    // assign ranks
    let currentRank = 1;
    let prevVotes = -1;
    let sameRankCount = 0;
    
    const leaderboard = players.map((player, index) => {
      // TODO: query db for best submission
      const bestDrawing = topDrawings.find(drawing => drawing.creator.id === player.id);
      let bestSubmission = null;
      
      if (bestDrawing) {
        bestSubmission = {
          type: 'drawing',
          imageId: bestDrawing.drawingId,
          imageUrl: bestDrawing.imageUrl,
          enhancedImageUrl: bestDrawing.enhancedImageUrl,
          votes: bestDrawing.votes,
          captionId: bestDrawing.caption.id,
          captionText: bestDrawing.caption.text,
          captionCreator: bestDrawing.caption.creator
        };
      }
      
      // calculate rank
      if (index === 0) {
        prevVotes = player.totalVotes;
        return {
          userId: player.id,
          username: player.username,
          profilePictureUrl: player.profilePictureUrl,
          totalVotes: player.totalVotes,
          drawingVotes: player.totalVotes,
          votePercentage: player.votePercentage,
          bestSubmission,
          bestVotes: bestSubmission ? bestSubmission.votes : 0,
          medal: player.medal,
          rank: currentRank
        };
      }
      
      // handle different vote counts
      if (player.totalVotes < prevVotes) {
        currentRank += sameRankCount + 1;
        sameRankCount = 0;
      } else {
        sameRankCount++;
      }
      
      prevVotes = player.totalVotes;
      
      // return the formatted player
      return {
        userId: player.id,
        username: player.username,
        profilePictureUrl: player.profilePictureUrl,
        totalVotes: player.totalVotes,
        drawingVotes: player.totalVotes,
        votePercentage: player.votePercentage,
        bestSubmission,
        bestVotes: bestSubmission ? bestSubmission.votes : 0,
        medal: player.medal,
        rank: currentRank
      };
    });
    
    // format top drawings for response (can be used for showcase)
    const topDrawingsFormatted = topDrawings.map(drawing => ({
      drawingId: drawing.drawingId,
      imageUrl: drawing.imageUrl,
      enhancedImageUrl: drawing.enhancedImageUrl,
      votes: drawing.votes,
      votePercentage: totalGameVotes > 0 ? Math.round((drawing.votes / totalGameVotes) * 100) : 0,
      creator: drawing.creator,
      caption: drawing.caption
    }));
    
    // return results with metadata
    res.send({
      gameId: parseInt(gameId),
      gameCode: 'ABCDEF', // placeholder
      title: 'Placeholder Garlic Text Game',
      totalVotes: totalGameVotes,
      topDrawings: topDrawingsFormatted,
      leaderboard
    });
    
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving game results"
    });
  }
};
