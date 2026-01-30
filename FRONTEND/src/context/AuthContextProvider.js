import authContext from './AuthContext.js'
import { useEffect, useState, useRef } from 'react'
import axios from 'axios'

function AuthContextProvider({ children }) {
    let [isUser, setIsUser] = useState(null)
    let [loading, setLoading] = useState(true)
    const wasLoggedIn = useRef(false)
    const lastAuthToken = useRef(null)

    useEffect(() => {
        // Check if user is logged in by checking localStorage
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('authToken')
            const storedUser = localStorage.getItem('user')

            // Detect if localStorage was cleared (token existed before but now it's gone)
            const wasCleared = lastAuthToken.current !== null && token === null

            if (token && storedUser) {
                try {
                    const user = JSON.parse(storedUser)
                    setIsUser(user)
                    wasLoggedIn.current = true
                    lastAuthToken.current = token
                } catch (error) {
                    console.error('Error parsing user data:', error)
                    setIsUser(null)
                    lastAuthToken.current = null
                }
            } else {
                // If localStorage is cleared but user was logged in
                if (wasLoggedIn.current) {
                    // Clear cookie from backend
                    try {
                        await axios.post('http://localhost:8080/logout', {}, {
                            withCredentials: true
                        })
                        console.log('Cookie cleared due to localStorage being cleared')
                    } catch (error) {
                        console.error('Error clearing cookie:', error)
                    }
                    wasLoggedIn.current = false
                    lastAuthToken.current = null

                    // Dispatch authChange event for same-tab components
                    window.dispatchEvent(new Event('authChange'))
                }
                setIsUser(null)
            }
            setLoading(false)
        }

        checkAuthStatus()

        // Poll localStorage every 500ms to detect manual clearing
        const pollInterval = setInterval(() => {
            const currentToken = localStorage.getItem('authToken')

            // If token was removed (localStorage cleared)
            if (lastAuthToken.current !== null && currentToken === null) {
                console.log('LocalStorage cleared detected via polling')
                checkAuthStatus()
            }
        }, 500)

        // Listen for storage changes (for login/logout updates from other tabs)
        const handleStorageChange = () => {
            checkAuthStatus()
        }

        window.addEventListener('storage', handleStorageChange)

        // Custom event for same-tab updates
        window.addEventListener('authChange', handleStorageChange)

        return () => {
            clearInterval(pollInterval)
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('authChange', handleStorageChange)
        }
    }, [])

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '24px',
                fontWeight: 'bold'
            }}>
                Loading...
            </div>
        )
    }

    return (
        <authContext.Provider value={isUser}>
            {children}
        </authContext.Provider>
    )
}

export default AuthContextProvider