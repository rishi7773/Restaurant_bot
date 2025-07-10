import React, { useMemo } from 'react';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';

const BotChat = () => {
  const directLine = useMemo(
    () =>
      createDirectLine({
        secret: '7pA5v1bYncsOKLRnDaX4myOJklKEb2h7SPTzHSSWxVt6Zyfta8TkJQQJ99BGACi5YpzAArohAAABAZBS45O5.M5r27Pavha4XgKIfQf8CVWMLpHjqygVOsramAHeCtXLPXfNMm6LeJQQJ99BGACi5YpzAArohAAABAZBS3Pr7'  }),
    []
  );

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <ReactWebChat
        directLine={directLine}
        userID="user-id"
        username="Rishi"
        locale="en-IN"
        styleOptions={{
          bubbleBackground: '#f1f1f1',
          bubbleFromUserBackground: '#aee571',
          hideUploadButton: true,
          botAvatarInitials: 'SB',
          userAvatarInitials: 'You',
          backgroundColor: '#ffffff'
        }}
      />
    </div>
  );
};

export default BotChat;
