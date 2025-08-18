document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-btn')
  const syncBtn = document.getElementById('sync-btn')
  const status = document.getElementById('status')
  
  function showStatus(message, type = 'success') {
    status.textContent = message
    status.className = `status ${type}`
    status.style.display = 'block'
    setTimeout(() => {
      status.style.display = 'none'
    }, 3000)
  }
  
  connectBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://mailpulse-mauve.vercel.app/dashboard' })
    showStatus('Opening MailPulse dashboard...')
  })
  
  syncBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (tab.url && tab.url.includes('mail.google.com')) {
        showStatus('MailPulse is active on Gmail!')
      } else {
        showStatus('Please navigate to Gmail to use tracking', 'error')
      }
    } catch (error) {
      showStatus('Error checking Gmail status', 'error')
    }
  })
  
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0]
    if (currentTab && currentTab.url && currentTab.url.includes('mail.google.com')) {
      syncBtn.textContent = 'Gmail Active'
      syncBtn.style.backgroundColor = '#34a853'
    }
  })
})