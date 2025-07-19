import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Tauri APIs for testing
if (typeof window !== 'undefined') {
  (window as any).__TAURI__ = {
    invoke: vi.fn(),
    event: {
      listen: vi.fn(),
      emit: vi.fn(),
    },
  };
} 