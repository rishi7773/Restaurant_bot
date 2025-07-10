// src/App.js
import React from 'react';
import Chat from './components/Chat';
import BotChat from './components/BotChat';
import './App.css';

function App() {
    return ( <
        div className = "restaurant-chat-app" >
        <
        div className = "restaurant-header" >
        <
        div className = "restaurant-brand" >
        <
        h1 > Rajasthani Restaurant < /h1> <
        p > Restaurant Assistant < /p> < /
        div > <
        div className = "restaurant-info" >
        <
        div className = "info-item" >
        <
        span className = "material-icons" > schedule < /span> <
        span > Open: 10 AM - 10 PM < /span> < /
        div > <
        div className = "info-item" >
        <
        span className = "material-icons" > phone < /span> <
        span > (+91) 45658 - 47890 < /span> < /
        div > <
        /div> < /
        div >

        <
        div className = "chat-container-wrapper"
        style = {
            { display: 'flex', flexWrap: 'wrap', gap: '20px' }
        } >
        <
        div style = {
            { flex: '1 1 48%' }
        } >
        <
        h2 style = {
            { textAlign: 'center', marginBottom: '10px' }
        } > 🔧Custom Chat UI < /h2> <
        Chat / >
        <
        /div> <
        div style = {
            { flex: '1 1 48%' }
        } >
        <
        h2 style = {
            { textAlign: 'center', marginBottom: '10px' }
        } > 🤖Microsoft Web Chat < /h2> <
        BotChat / >
        <
        /div> < /
        div >

        <
        div className = "restaurant-footer" >
        <
        div className = "footer-section" >
        <
        h3 > Our Specialties < /h3> <
        p > Italian Cuisine• Seafood• Desserts < /p> < /
        div > <
        div className = "footer-section" >
        <
        h3 > Location < /h3> <
        p > Mansarovar, Pink City < /p> < /
        div > <
        /div> < /
        div >
    );
}

export default App;