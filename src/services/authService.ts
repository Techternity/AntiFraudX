interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  // User object can be nested under 'user' or directly in the response
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    organization?: string;
    username?: string;
  };
  // Direct user properties (for when user fields are at the root level)
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  organization?: string;
  username?: string;
  message?: string;
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log('Sending auth request to backend:', credentials);
    
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Network error occurred. Please try again.'
    };
  }
};

export const storeAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Use this function to test login without actual backend authentication
export const testLoginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log('Sending TEST auth request with:', credentials);
    
    const response = await fetch('/api/test/auth-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('Test login response status:', response.status);
    const data = await response.json();
    console.log('Test login response data:', data);
    
    return data;
  } catch (error) {
    console.error('Test login error:', error);
    return {
      success: false,
      message: 'Network error occurred. Please try again.'
    };
  }
};