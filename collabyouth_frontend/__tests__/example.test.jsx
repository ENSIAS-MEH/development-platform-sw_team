import { render, screen } from '@testing-library/react'

test('exemple basique', () => {
  render(<h1>CollabYouth</h1>)
  expect(screen.getByText('CollabYouth')).toBeInTheDocument()
})