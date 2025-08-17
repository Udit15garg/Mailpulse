interface SlackMessage {
  text: string
  channel?: string
  username?: string
  icon_emoji?: string
  attachments?: Array<{
    color?: string
    title?: string
    text?: string
    fields?: Array<{
      title: string
      value: string
      short?: boolean
    }>
  }>
}

export async function sendSlackMessage(message: SlackMessage): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL is not configured')
    return false
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error('Failed to send Slack message:', response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending Slack message:', error)
    return false
  }
}

export async function sendSlackNotification(
  title: string,
  message: string,
  color: string = 'good'
): Promise<boolean> {
  return sendSlackMessage({
    text: title,
    attachments: [
      {
        color,
        text: message,
      },
    ],
  })
}

export async function sendSlackAlert(
  title: string,
  message: string,
  fields?: Array<{ title: string; value: string; short?: boolean }>
): Promise<boolean> {
  return sendSlackMessage({
    text: `🚨 ${title}`,
    attachments: [
      {
        color: 'danger',
        text: message,
        fields,
      },
    ],
  })
}