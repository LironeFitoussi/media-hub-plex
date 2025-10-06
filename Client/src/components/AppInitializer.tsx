import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchUser } from '../redux/slices/userSlice';
import { useAuth0 } from '@auth0/auth0-react';
import type { Auth0User } from '@/types';
import api from '@/services/api';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.user);
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  // const { user: userState } = useAppSelector((state) => state.user);

  useEffect(() => {
    const initializeApp = async () => {
      if (isAuthenticated && user) {
        
        // Set API headers with token
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: 'openid profile email',
            }
          });
          
          const bearerToken = `Bearer ${token}`;
          // console.log(bearerToken);
          api.defaults.headers.common['Authorization'] = bearerToken;
          
          // Fetch user data
          dispatch(fetchUser({
            userData: user as Auth0User,
            token: token as string,
          }));
        } catch (error) {
          console.error('Failed to set API headers:', error);
        }
      }
    };

    initializeApp();
  }, [dispatch, isAuthenticated, user, getAccessTokenSilently]);

  // Show loading state while fetching user
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  // Show error state if user fetch failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to load user</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => dispatch(fetchUser({
              userData: user as Auth0User,
            }))}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render children when user is loaded or no error
  return <>{children}</>;
};

export default AppInitializer;
