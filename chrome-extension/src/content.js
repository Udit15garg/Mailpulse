console.log('MailPulse Gmail extension loaded')

let isComposing = false
let trackingToggle = null
let composeContainer = null

function waitForElement(selector, callback, timeout = 10000) {
  const startTime = Date.now()
  const interval = setInterval(() => {
    const element = document.querySelector(selector)
    if (element) {
      clearInterval(interval)
      callback(element)
    } else if (Date.now() - startTime > timeout) {
      clearInterval(interval)
      console.log('Element not found:', selector)
    }
  }, 100)
}

function createTrackingToggle() {
  if (trackingToggle) return trackingToggle

  const toggle = document.createElement('div')
  toggle.id = 'mailpulse-toggle'
  toggle.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: #f8f9fa;
    border: 1px solid #dadce0;
    border-radius: 18px;
    font-family: 'Google Sans', Roboto, sans-serif;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    margin: 4px;
    transition: background-color 0.2s;
  `

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.id = 'mailpulse-checkbox'
  checkbox.style.cssText = `
    margin: 0;
    cursor: pointer;
  `

  const label = document.createElement('label')
  label.htmlFor = 'mailpulse-checkbox'
  label.textContent = 'Track this email'
  label.style.cssText = `
    cursor: pointer;
    font-weight: 500;
    color: #3c4043;
  `

  toggle.appendChild(checkbox)
  toggle.appendChild(label)

  toggle.addEventListener('mouseenter', () => {
    toggle.style.backgroundColor = '#f1f3f4'
  })

  toggle.addEventListener('mouseleave', () => {
    toggle.style.backgroundColor = '#f8f9fa'
  })

  trackingToggle = toggle
  return toggle
}

function injectTrackingToggle() {
  const composeToolbar = document.querySelector('[role="toolbar"]')
  const composeFooter = document.querySelector('.btC .dC')
  
  const targetContainer = composeToolbar || composeFooter
  
  if (targetContainer && !document.getElementById('mailpulse-toggle')) {
    const toggle = createTrackingToggle()
    
    if (composeToolbar) {
      targetContainer.appendChild(toggle)
    } else if (composeFooter) {
      targetContainer.insertBefore(toggle, targetContainer.firstChild)
    }
    
    console.log('MailPulse tracking toggle injected')
  }
}

function observeCompose() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches('[role="dialog"]') || node.querySelector('[role="dialog"]')) {
            setTimeout(injectTrackingToggle, 500)
          }
          
          if (node.matches('[role="toolbar"]') || node.querySelector('[role="toolbar"]')) {
            setTimeout(injectTrackingToggle, 100)
          }
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

function interceptSendButton() {
  document.addEventListener('click', async (e) => {
    const sendButton = e.target.closest('[role="button"][data-tooltip*="Send"], [role="button"][aria-label*="Send"]')
    
    if (sendButton && document.getElementById('mailpulse-checkbox')?.checked) {
      e.preventDefault()
      e.stopPropagation()
      
      try {
        await handleTrackedEmail(sendButton)
      } catch (error) {
        console.error('MailPulse tracking failed:', error)
        sendButton.click()
      }
    }
  }, true)
}

async function handleTrackedEmail(sendButton) {
  const subjectInput = document.querySelector('input[name="subjectbox"]')
  const recipientInput = document.querySelector('input[email]')
  const composeBody = document.querySelector('[role="textbox"][aria-label*="Message"]')
  
  const subject = subjectInput?.value || ''
  const recipient = recipientInput?.value || ''
  
  if (!recipient) {
    alert('Please enter a recipient email address')
    return
  }
  
  try {
    const response = await fetch('https://mailpulse-mauve.vercel.app/api/track/public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject,
        to: recipient,
        messageId: generateMessageId()
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create tracking pixel')
    }
    
    const data = await response.json()
    
    if (composeBody && data.pixelUrl) {
      const pixelImg = `<img src="${data.pixelUrl}" width="1" height="1" style="display: none;" alt="">`
      
      const currentHTML = composeBody.innerHTML
      composeBody.innerHTML = currentHTML + pixelImg
      
      console.log('MailPulse tracking pixel injected')
    }
    
    sendButton.click()
    
  } catch (error) {
    console.error('MailPulse API error:', error)
    alert('Failed to enable tracking. Email will be sent without tracking.')
    sendButton.click()
  }
}

function generateMessageId() {
  return `mailpulse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function addSentLabelMonitoring() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const sentItems = node.querySelectorAll('[data-thread-id]')
          sentItems.forEach(addTrackingStatus)
        }
      })
    })
  })
  
  const sentFolder = document.querySelector('[href="#sent"]')
  if (sentFolder) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
}

function addTrackingStatus(emailElement) {
  if (emailElement.querySelector('.mailpulse-status')) return
  
  const status = document.createElement('span')
  status.className = 'mailpulse-status'
  status.textContent = '📧'
  status.title = 'Tracked with MailPulse'
  status.style.cssText = `
    margin-left: 8px;
    font-size: 12px;
    opacity: 0.7;
  `
  
  const subjectElement = emailElement.querySelector('[data-thread-id] span')
  if (subjectElement) {
    subjectElement.appendChild(status)
  }
}

if (window.location.hostname === 'mail.google.com') {
  waitForElement('body', () => {
    observeCompose()
    interceptSendButton()
    addSentLabelMonitoring()
    
    setTimeout(injectTrackingToggle, 1000)
  })
}