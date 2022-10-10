import React from 'react';
import { render, screen } from '@testing-library/react';
import { StartGameComponent } from './start-game.component';

describe('StartGame component specs', () => {
  it('should display a list of topics', async () => {
    // TODO: Mock service
    render(<StartGameComponent />);

    const items = await screen.findAllByRole('listitem');

    expect(items).toHaveLength(2);
  });
});
