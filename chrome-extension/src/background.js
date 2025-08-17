chrome.runtime.onInstalled.addListener(() => {
  console.log('MailPulse extension installed')
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId)
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    chrome.storage.local.get(['mailpulseData'], (result) => {
      sendResponse({ data: result.mailpulseData || {} })
    })
    return true
  }
  
  if (request.action === 'setData') {
    chrome.storage.local.set({ mailpulseData: request.data }, () => {
      sendResponse({ success: true })
    })
    return true
  }
})