import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// mock socket
const mockEmit = jest.fn();
jest.mock('../../../Socket/useSocket', () => () => ({
  emit: mockEmit,
}));

// setup sessionStorage mock
beforeEach(() => {
  sessionStorage.setItem('firstName', 'Test');
  sessionStorage.setItem('userId', 'test-user');
  mockEmit.mockClear();
  mockNavigate.mockClear();
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch.mockClear();
});

describe('HomePage', () => {
  test('renders welcome message and links', () => {
    render(<HomePage />, { wrapper: MemoryRouter });

    expect(screen.getByText('Welcome to Coup, Test')).toBeInTheDocument();
    expect(screen.getByText('Create Game')).toBeInTheDocument();
    expect(screen.getByText('Join Game')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('handles successful game creation and navigation', async () => {
    const mockLobbyCode = 'ABC123';
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ lobby: mockLobbyCode }),
    });

    render(<HomePage />, { wrapper: MemoryRouter });

    const button = screen.getByText('Create Game');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockEmit).toHaveBeenCalledWith(
        'join-lobby',
        { username: 'test-user', lobby: mockLobbyCode },
        expect.any(Function)
      );

      // sim callback
      const callback = mockEmit.mock.calls[0][2];
      callback({ status: 'ok' });

      expect(mockNavigate).toHaveBeenCalledWith(`/lobby?lobby=${mockLobbyCode}`, {
        state: { username: 'test-user' },
      });
    });
  });

  test('handles fetch failure gracefully', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
  
    // shut up console!!
    jest.spyOn(console, 'error').mockImplementation(() => {});
  
    render(<HomePage />, { wrapper: MemoryRouter });
  
    fireEvent.click(screen.getByText('Create Game'));
  
    await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
            "Error creating lobby:",
            expect.any(Error)
          );
    });
  });
  

});
