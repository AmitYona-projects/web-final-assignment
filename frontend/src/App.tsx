import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthLayout from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import RegistrationPage from './pages/RegistrationPage'
import ProfilePage from './pages/ProfilePage'
import AppLayout from './layouts/AppLayout'
import AuthRequired from './components/AuthRequired'

function App() {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <AuthRequired>
            <AppLayout />
          </AuthRequired>
        }
      >
        <Route index element={<HomePage />} />
        <Route path='profile' element={<ProfilePage />} />
      </Route>
      <Route path='/auth' element={<AuthLayout />}>
        <Route index element={<Navigate to='login' />} />
        <Route path='login' element={<LoginPage />} />
        <Route path='register' element={<RegistrationPage />} />
      </Route>
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  )
}

export default App
