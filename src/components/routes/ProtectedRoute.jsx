import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import appConfig from '../configs/app.config'
import useAuth from '../../utils/hooks/useAuth'
import { REDIRECT_URL_KEY } from '../../constants/app.constant'
import { getTenantData, getCompanyData } from '../../utils/functions/tokenEncryption'
import { isSessionCompanyInactive } from '../../utils/functions/tenantStatus'

const { unAuthenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { authenticated, logoutInactiveCompany } = useAuth()
    const location = useLocation()
    const isInactiveSession = isSessionCompanyInactive(
        getTenantData(),
        getCompanyData()
    )

    useEffect(() => {
        if (authenticated && isInactiveSession) {
            logoutInactiveCompany()
        }
    }, [authenticated, isInactiveSession, logoutInactiveCompany])

    if (!authenticated) {
        return (
            <Navigate
                replace
                to={`${unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${location.pathname}`}
            />
        )
    }

    if (isInactiveSession) {
        return (
            <Navigate
                replace
                to={unAuthenticatedEntryPath}
            />
        )
    }

    return <Outlet />
}

export default ProtectedRoute
