import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import store from './store/store';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="App">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
