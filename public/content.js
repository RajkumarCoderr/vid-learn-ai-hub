
// YouTube Learning Assistant - Content Script

console.log('YouTube Learning Assistant: Content script loaded');

// Global variables
let focusModeActive = false;
let styleElement = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  switch (request.action) {
    case 'getVideoInfo':
      const videoInfo = getVideoInfo();
      sendResponse(videoInfo);
      break;
      
    case 'toggleFocusMode':
      toggleFocusMode(request.value);
      sendResponse({ success: true });
      break;
      
    case 'showCommentDialog':
      showCommentOptions(request.comments);
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // Keep the message channel open for async responses
});

// Get current video information
function getVideoInfo() {
  try {
    const title = document.querySelector('h1.title.style-scope.ytd-video-primary-info-renderer')?.textContent
      || document.querySelector('h1.title')?.textContent
      || document.title.replace(' - YouTube', '');
      
    return { title, url: window.location.href };
  } catch (err) {
    console.error('Error getting video info:', err);
    return { error: 'Could not retrieve video information' };
  }
}

// Toggle focus mode by hiding distracting elements
function toggleFocusMode(enable) {
  if (enable === focusModeActive) return;
  
  focusModeActive = enable;
  
  if (enable) {
    // Create style element if it doesn't exist
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'youtube-learning-assistant-focus-mode';
      document.head.appendChild(styleElement);
    }
    
    // CSS to hide distracting elements
    styleElement.textContent = `
      /* Hide sidebar */
      #secondary, #related, ytd-watch-next-secondary-results-renderer {
        display: none !important;
      }
      
      /* Hide comments */
      #comments, ytd-comments {
        display: none !important;
      }
      
      /* Hide end screen recommendations */
      .ytp-ce-element {
        display: none !important;
      }
      
      /* Hide in-video info cards */
      .ytp-cards-button, .ytp-cards-teaser {
        display: none !important;
      }
      
      /* Expand video player */
      #primary, #primary-inner, #player-container, #player {
        width: 100% !important;
        max-width: 100% !important;
      }
    `;
    
    // Add focus mode indicator
    const indicator = document.createElement('div');
    indicator.id = 'focus-mode-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 9999;
      transition: opacity 0.3s ease;
    `;
    indicator.textContent = 'Focus Mode Active';
    document.body.appendChild(indicator);
    
    // Fade out the indicator after 3 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 500);
    }, 3000);
  } else {
    // Remove focus mode styles
    if (styleElement) {
      document.head.removeChild(styleElement);
      styleElement = null;
    }
    
    // Remove any indicators if they exist
    const indicator = document.getElementById('focus-mode-indicator');
    if (indicator) {
      indicator.parentNode.removeChild(indicator);
    }
  }
}

// Show comment options dialog
function showCommentOptions(comments) {
  if (!comments || !comments.length) return;
  
  // Remove any existing dialogs
  const existingDialog = document.getElementById('comment-options-dialog');
  if (existingDialog) {
    existingDialog.parentNode.removeChild(existingDialog);
  }
  
  // Create dialog container
  const dialog = document.createElement('div');
  dialog.id = 'comment-options-dialog';
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #212121;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    z-index: 9999;
    width: 350px;
    max-width: 90%;
  `;
  
  // Create dialog header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  `;
  
  const title = document.createElement('h3');
  title.textContent = 'Choose a Comment';
  title.style.cssText = `
    margin: 0;
    color: #ffffff;
    font-size: 16px;
  `;
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: #aaaaaa;
    font-size: 20px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  closeButton.onclick = () => {
    dialog.parentNode.removeChild(dialog);
  };
  
  header.appendChild(title);
  header.appendChild(closeButton);
  dialog.appendChild(header);
  
  // Create comment options
  const commentList = document.createElement('div');
  commentList.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 12px;
  `;
  
  comments.forEach((comment, index) => {
    const commentItem = document.createElement('div');
    commentItem.style.cssText = `
      background-color: #333333;
      padding: 12px;
      border-radius: 6px;
      color: #ffffff;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
    `;
    commentItem.onmouseover = () => {
      commentItem.style.backgroundColor = '#444444';
    };
    commentItem.onmouseout = () => {
      commentItem.style.backgroundColor = '#333333';
    };
    commentItem.onclick = () => {
      // Copy comment to clipboard
      navigator.clipboard.writeText(comment)
        .then(() => {
          // Show success message
          const message = document.createElement('div');
          message.textContent = 'Copied to clipboard!';
          message.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4caf50;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
          `;
          document.body.appendChild(message);
          
          // Find the comment input field and focus it
          const commentInput = document.querySelector('div#placeholder-area');
          if (commentInput) {
            commentInput.click();
          }
          
          // Clean up
          setTimeout(() => {
            dialog.parentNode.removeChild(dialog);
            setTimeout(() => {
              message.parentNode.removeChild(message);
            }, 1000);
          }, 500);
        })
        .catch(err => {
          console.error('Failed to copy comment:', err);
        });
    };
    
    // Comment counter
    const counter = document.createElement('div');
    counter.style.cssText = `
      margin-bottom: 4px;
      font-size: 12px;
      color: #aaaaaa;
    `;
    counter.textContent = `Option ${index + 1}`;
    
    // Comment text
    const text = document.createElement('div');
    text.textContent = comment;
    
    commentItem.appendChild(counter);
    commentItem.appendChild(text);
    commentList.appendChild(commentItem);
  });
  
  dialog.appendChild(commentList);
  
  // Create footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    display: flex;
    justify-content: flex-end;
  `;
  
  const refreshButton = document.createElement('button');
  refreshButton.textContent = 'Generate More';
  refreshButton.style.cssText = `
    background-color: #3ea6ff;
    color: #0f0f0f;
    border: none;
    border-radius: 18px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  `;
  refreshButton.onmouseover = () => {
    refreshButton.style.backgroundColor = '#65b8ff';
  };
  refreshButton.onmouseout = () => {
    refreshButton.style.backgroundColor = '#3ea6ff';
  };
  refreshButton.onclick = () => {
    // Send message to generate more comments
    chrome.runtime.sendMessage({ action: "generateComments", refresh: true });
    dialog.parentNode.removeChild(dialog);
  };
  
  footer.appendChild(refreshButton);
  dialog.appendChild(footer);
  
  // Add dialog to page
  document.body.appendChild(dialog);
  
  // Allow closing by clicking outside
  document.addEventListener('click', function closeOnClickOutside(event) {
    if (!dialog.contains(event.target) && document.body.contains(dialog)) {
      dialog.parentNode.removeChild(dialog);
      document.removeEventListener('click', closeOnClickOutside);
    }
  });
}

// Check if focus mode was previously enabled
chrome.storage.local.get(['focusMode'], (result) => {
  if (result.focusMode) {
    toggleFocusMode(true);
  }
});

// Create CSS for content script styles
const contentStyle = document.createElement('style');
contentStyle.textContent = `
  #comment-options-dialog {
    font-family: 'Roboto', sans-serif;
  }
`;
document.head.appendChild(contentStyle);
