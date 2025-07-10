import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = () => {
        const [messages, setMessages] = useState([]);
        const [inputValue, setInputValue] = useState('');
        const [isTyping, setIsTyping] = useState(false);
        const messagesEndRef = useRef(null);
        const conversationIdRef = useRef(Date.now().toString());

        useEffect(() => {
            scrollToBottom();
        }, [messages]);

        const scrollToBottom = () => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        };

        const sendMessage = async() => {
            if (!inputValue.trim()) return;

            const userMessage = { text: inputValue, sender: 'user' };
            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsTyping(true);

            try {
                const activity = {
                    type: 'message',
                    text: inputValue,
                    from: { id: 'user1', name: 'User' },
                    conversation: { id: conversationIdRef.current }
                };

                const response = await fetch('http://localhost:3000/api/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(activity)
                });

                const botActivities = await response.json();

                if (Array.isArray(botActivities)) {
                    const botMessages = botActivities
                        .filter(act => act.type === 'message')
                        .map(act => ({ text: act.text, sender: 'bot' }));
                    setMessages(prev => [...prev, ...botMessages]);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                setMessages(prev => [
                    ...prev,
                    { text: 'Error: Failed to connect to the server.', sender: 'bot' }
                ]);
            } finally {
                setIsTyping(false);
            }
        };

        const handleKeyPress = e => {
            if (e.key === 'Enter') sendMessage();
        };

        return ( <
            div className = "chat-container" >
            <
            div className = "chat-header" > R - Bot Assistant < /div> <
            div className = "chat-messages" > {
                messages.map((msg, i) => ( <
                    div key = { i }
                    className = { `message ${msg.sender}` } > { msg.text } <
                    /div>
                ))
            } {
                isTyping && < div className = "message bot" > Typing... < /div>} <
                    div ref = { messagesEndRef }
                /> <
                /div> <
                div className = "chat-input" >
                    <
                    input
                type = "text"
                placeholder = "Type your message..."
                value = { inputValue }
                onChange = { e => setInputValue(e.target.value) }
                onKeyDown = { handleKeyPress }
                /> <
                button onClick = { sendMessage } > Send < /button> <
                    /div> <
                    /div>
            );
        };

        export default Chat;