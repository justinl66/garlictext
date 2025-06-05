// Simple test to check round-robin assignment
const express = require('express');
const app = express();

// Mock data for testing
const mockParticipants = [
  { id: 'user1', username: 'Alice' },
  { id: 'user2', username: 'Bob' },
  { id: 'user3', username: 'Charlie' }
];

function testRoundRobinAssignment(participants, currentUserId) {
  console.log('\n=== Testing Round-Robin Assignment ===');
  console.log('Participants:', participants.map(p => ({ id: p.id, username: p.username })));
  console.log('Current user ID:', currentUserId);

  const participantCount = participants.length;
  const currentUserIndex = participants.findIndex(p => p.id === currentUserId);
  
  if (currentUserIndex === -1) {
    console.log('❌ User not found in participants');
    return null;
  }

  let assignedImageOwnerIndex;
  
  if (participantCount === 1) {
    assignedImageOwnerIndex = currentUserIndex;
  } else if (participantCount === 2) {
    assignedImageOwnerIndex = currentUserIndex === 0 ? 1 : 0;
  } else {
    assignedImageOwnerIndex = (currentUserIndex + 1) % participantCount;
  }

  console.log(`✅ User ${currentUserId} (index ${currentUserIndex}) should caption image from user at index ${assignedImageOwnerIndex}`);
  console.log(`✅ Assigned image owner: ${participants[assignedImageOwnerIndex].username} (${participants[assignedImageOwnerIndex].id})`);
  
  return participants[assignedImageOwnerIndex];
}

// Test with 3 users
console.log('Testing with 3 users:');
testRoundRobinAssignment(mockParticipants, 'user1'); // Should get user2's image
testRoundRobinAssignment(mockParticipants, 'user2'); // Should get user3's image
testRoundRobinAssignment(mockParticipants, 'user3'); // Should get user1's image

// Test with 2 users
const twoUsers = mockParticipants.slice(0, 2);
console.log('\nTesting with 2 users:');
testRoundRobinAssignment(twoUsers, 'user1'); // Should get user2's image
testRoundRobinAssignment(twoUsers, 'user2'); // Should get user1's image

// Test with 1 user
const oneUser = mockParticipants.slice(0, 1);
console.log('\nTesting with 1 user:');
testRoundRobinAssignment(oneUser, 'user1'); // Should get their own image
