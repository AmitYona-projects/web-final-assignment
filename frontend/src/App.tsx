import './App.css'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'

function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/auth' element={<AuthLayout />}>
        <Route path='login' element={<LoginPage />} />
        <Route path='register' element={<RegistrationPage />} />
      </Route>
    </Routes>
  )
}

export default App
