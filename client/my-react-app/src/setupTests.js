import '@testing-library/jest-dom';

import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.HTMLMediaElement.prototype.play = jest.fn();
global.HTMLMediaElement.prototype.pause = jest.fn();