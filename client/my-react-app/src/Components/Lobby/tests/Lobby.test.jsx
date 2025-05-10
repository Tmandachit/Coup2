import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Lobby from '../Lobby';

// Mock useSocket
const mockOn = jest.fn();
const mockOff = jest.fn();
const mockEmit = jest.fn();
jest.mock('../../../Socket/useSocket', () => () => ({
  on: mockOn,
  off: mockOff,
  emit: mockEmit,
}));

beforeAll(() => {
  window.HTMLMediaElement.prototype.play = () => {};
  window.HTMLMediaElement.prototype.pause = () => {};
});

// Mock sessionStorage and useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [
    new URLSearchParams({ lobby: 'TEST123' }),
  ],
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  sessionStorage.setItem('userId', 'test-user');
  global.fetch = jest.fn();
  mockOn.mockClear();
  mockOff.mockClear();
  mockEmit.mockClear();
});

afterEach(() => {
  global.fetch.mockReset();
});

describe('Lobby', () => {
  test('renders lobby code and buttons', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: [] }),
    });

    render(<Lobby />, { wrapper: MemoryRouter });

    expect(await screen.findByText(/Lobby Code: TEST123/i)).toBeInTheDocument();
    expect(screen.getByText('Players:')).toBeInTheDocument();
    expect(screen.getByText('Ready Up')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeInTheDocument();
    expect(screen.getByText('Leave Lobby')).toBeInTheDocument();
  });

  test('emits ready toggle on button click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        players: [{ name: 'test-user', ready: false }],
      }),
    });

    render(<Lobby />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalledWith('lobby-update', expect.any(Function));
    });

    const callback = mockOn.mock.calls.find(call => call[0] === 'lobby-update')[1];

    await act(async () => {
      callback([{ name: 'test-user', ready: false }]);
    });

    const readyButton = screen.getByText('Ready Up');
    fireEvent.click(readyButton);

    expect(mockEmit).toHaveBeenCalledWith('playerReady', {
      lobbyCode: 'TEST123',
      userName: 'test-user',
      ready: true,
    });
  });

  test('emits start-game and navigates on game-started event', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        players: [{ name: 'test-user', ready: true }],
      }),
    });

    render(<Lobby />, { wrapper: MemoryRouter });

    const callback = mockOn.mock.calls.find(call => call[0] === 'game-started')[1];

    await act(async () => {
      callback();
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/game?lobby=TEST123');
    });
  });

  test('emits leave-lobby and navigates on leave button click', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: [] }),
    });

    render(<Lobby />, { wrapper: MemoryRouter });

    const leaveButton = await screen.findByText('Leave Lobby');
    fireEvent.click(leaveButton);

    expect(mockEmit).toHaveBeenCalledWith('leave-lobby', {
      lobbyCode: 'TEST123',
      userName: 'test-user',
    });

    expect(mockNavigate).toHaveBeenCalledWith('/Home');
  });

  test('fetches player list on mount when lobbyCode exists', async () => {
    const mockPlayers = [{ name: 'test-user', ready: true }];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: mockPlayers }),
    });

    render(<Lobby />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/lobby/TEST123/players');
      expect(screen.getByText('test-user - Ready')).toBeInTheDocument();
    });
  });
});
