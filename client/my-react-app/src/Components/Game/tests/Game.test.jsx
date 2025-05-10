import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Game from '../Game';
import { MemoryRouter } from 'react-router-dom';

// Mock sessionStorage
beforeAll(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'userId') return 'TestUser';
    return null;
  });
});

// Mock socket
const mockOn = jest.fn();
const mockEmit = jest.fn();
const mockOff = jest.fn();

jest.mock('../../../Socket/useSocket', () => () => ({
  on: mockOn,
  emit: mockEmit,
  off: mockOff,
}));

// Mock confetti
jest.mock('canvas-confetti', () => ({
  create: () => jest.fn(),
}));

// Silence console logs
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Game component', () => {
  beforeEach(() => {
    mockOn.mockClear();
    mockEmit.mockClear();
    mockOff.mockClear();
  });

  test('renders rule and cheat sheet buttons', () => {
    render(<Game />, { wrapper: MemoryRouter });
    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(screen.getByText('Cheat Sheet')).toBeInTheDocument();
  });

  test('renders default event log message', () => {
    render(<Game />, { wrapper: MemoryRouter });
    expect(screen.getByText('Event Log:')).toBeInTheDocument();
    expect(screen.getByText('No game events yet.')).toBeInTheDocument();
  });


  test('handles game-log socket event', async () => {
    let gameLogHandler;
    mockOn.mockImplementation((event, handler) => {
      if (event === 'game-log') gameLogHandler = handler;
    });

    render(<Game />, { wrapper: MemoryRouter });
    await waitFor(() => gameLogHandler('Test log message'));
    expect(screen.getByText('Test log message')).toBeInTheDocument();
  });

  test('handles game-over socket event and shows winner overlay', async () => {
    let gameOverHandler;
    mockOn.mockImplementation((event, handler) => {
      if (event === 'game-over') gameOverHandler = handler;
    });

    render(<Game />, { wrapper: MemoryRouter });
    await waitFor(() => gameOverHandler({ winner: 'TestUser' }));
    expect(screen.getByText('🏆 Champion!')).toBeInTheDocument();
  });

  test('handles awaiting-response event', async () => {
    let responseHandler;
    mockOn.mockImplementation((event, handler) => {
      if (event === 'awaiting-response') responseHandler = handler;
    });

    render(<Game />, { wrapper: MemoryRouter });
    await waitFor(() => responseHandler({
      type: 'action',
      actor: 'OtherPlayer',
      action: 'steal',
      target: 'TestUser',
      requiredCard: 'captain'
    }));

    expect(screen.getByText('Challenge')).toBeInTheDocument();
    expect(screen.getByText('Block')).toBeInTheDocument();
  });
});
