import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../../tests/fixtures'
import App from '../../App'

async function renderApp() {
  mockApi()
  render(<App />)
  await screen.findByText('1 USD = 0.8764 EUR')
}

const sendInput = () => screen.getByRole('textbox', { name: 'Amount to send' })
const received = () => screen.getByTestId('received-amount')

describe('Converter (US1)', () => {
  it('defaults to 1,000 USD → EUR with the converted amount and rate line', async () => {
    await renderApp()
    expect(sendInput()).toHaveValue('1,000')
    expect(received()).toHaveTextContent('876.40')
    expect(screen.getByRole('button', { name: /Send currency: USD/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Receive currency: EUR/ })).toBeInTheDocument()
  })

  it('updates the result on every keystroke', async () => {
    const user = userEvent.setup()
    await renderApp()
    await user.clear(sendInput())
    await user.type(sendInput(), '2')
    expect(received()).toHaveTextContent('1.75')
    await user.type(sendInput(), '5')
    expect(received()).toHaveTextContent('21.91')
  })

  it('shows a blank result for an empty amount and rejects non-numeric characters', async () => {
    const user = userEvent.setup()
    await renderApp()
    await user.clear(sendInput())
    expect(received()).toHaveTextContent('')
    await user.type(sendInput(), 'a1-b0')
    expect(sendInput()).toHaveValue('10')
  })

  it('swaps currencies keeping the amount', async () => {
    const user = userEvent.setup()
    await renderApp()
    await user.click(screen.getByRole('button', { name: 'Swap currencies' }))
    expect(screen.getByText('1 EUR = 1.1410 USD')).toBeInTheDocument()
    expect(sendInput()).toHaveValue('1,000')
    expect(received()).toHaveTextContent('1,141.03')
  })
})
