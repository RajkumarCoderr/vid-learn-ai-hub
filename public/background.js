
// YouTube Learning Assistant - Background Script

console.log('YouTube Learning Assistant: Background service worker started');

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'generateSummary':
      generateSummary(request.videoId, sendResponse);
      break;
      
    case 'generateQuiz':
      generateQuiz(request.videoId, request.count, sendResponse);
      break;
      
    case 'exportNotes':
      exportNotes(request.videoId, request.format, sendResponse);
      break;
      
    case 'generateComments':
      generateComments(request.videoId, request.refresh, sendResponse);
      break;
      
    default:
      console.log('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // Keep the message channel open for async responses
});

// Mock function to generate summary
async function generateSummary(videoId, sendResponse) {
  console.log('Generating summary for video:', videoId);
  
  try {
    // In a real extension, this would use YouTube API and AI services
    // For demo purposes, we'll send back a mock success response after a delay
    setTimeout(() => {
      sendResponse({ success: true });
    }, 2000);
  } catch (err) {
    console.error('Error generating summary:', err);
    sendResponse({ error: 'Failed to generate summary' });
  }
}

// Mock function to generate quiz questions
async function generateQuiz(videoId, count, sendResponse) {
  console.log('Generating quiz for video:', videoId, 'with', count, 'questions');
  
  try {
    // In a real extension, this would use YouTube API and AI services
    // For demo purposes, we'll send back a mock success response after a delay
    setTimeout(() => {
      sendResponse({ success: true });
    }, 2000);
  } catch (err) {
    console.error('Error generating quiz:', err);
    sendResponse({ error: 'Failed to generate quiz' });
  }
}

// Mock function to export notes
async function exportNotes(videoId, format, sendResponse) {
  console.log('Exporting notes for video:', videoId, 'in format:', format);
  
  try {
    // In a real extension, this would generate a file for download
    // For demo purposes, we'll send back a mock success response after a delay
    setTimeout(() => {
      sendResponse({ success: true });
    }, 2000);
  } catch (err) {
    console.error('Error exporting notes:', err);
    sendResponse({ error: 'Failed to export notes' });
  }
}

// Mock function to generate comments
async function generateComments(videoId, refresh, sendResponse) {
  console.log('Generating comments for video:', videoId);
  
  try {
    // In a real extension, this would use AI to generate comment variations
    // For demo purposes, we'll send back a mock success response after a delay
    setTimeout(() => {
      sendResponse({ success: true });
    }, 1000);
  } catch (err) {
    console.error('Error generating comments:', err);
    sendResponse({ error: 'Failed to generate comments' });
  }
}

// Optional: Add chrome.tabs.onUpdated listener to inject content script
// when navigating between YouTube pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
    console.log('YouTube video page loaded:', tab.url);
    
    // You could send a message to the content script here if needed
    chrome.tabs.sendMessage(tabId, { action: "pageReloaded" }).catch(() => {
      // Handle potential errors when the content script isn't ready yet
    });
  }
});
