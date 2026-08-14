import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Eager initialization of core game systems
import './game/travel/TravelManager'
import './game/progression/ProgressManager'
import './game/trading/TradeManager'
import './components/Dialogue/DialogueManager'
import './components/Question/QuestionManager'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

