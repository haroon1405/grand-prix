# Deriv API Integration Plan For Trading App

## Goal

Build a trading game app using basic Deriv market data, without needing real-money trading for V1.

The simplest and safest approach is:

- use Deriv public WebSocket APIs for live market data
- simulate wallet, positions, and PnL in our own app
- keep Deriv PAT usage out of the frontend

## What Has Already Been Verified

### Public market-data access works

The following public WebSocket methods were confirmed working:

- `active_symbols`
- `ticks`
- `ticks_history`
- `contracts_for`
- `proposal`

This is enough to build a trading game / paper trading app.

### Authenticated account access also works

The PAT + `app_id` in local env were validated in a read-only probe.

Confirmed working:

- `GET /trading/v1/options/accounts`
- `POST /trading/v1/options/accounts/{accountId}/otp`
- authenticated WebSocket `balance`
- authenticated WebSocket `portfolio`
- authenticated WebSocket `profit_table`

No order was placed.

## Recommended Approach For V1

For V1, use only the public market-data APIs and simulate the trading logic yourself.

Why:

- no login flow needed
- no real account dependency
- simpler frontend architecture
- safer for a game app
- enough data for charts, prices, and fake positions

Use authenticated Deriv APIs later only if we want:

- real balances
- real open trades
- account-linked history
- actual order placement

## Deriv API Model

### 1. Public market data

Public WebSocket endpoint:

`wss://api.derivws.com/trading/v1/options/ws/public`

Use this for:

- instrument list
- live prices
- historical chart data
- contract metadata
- optional pricing/proposal data

### 2. Authenticated account/trading flow

Authenticated flow is split into REST + WebSocket.

REST base URL:

`https://api.derivws.com`

Required REST headers:

- `Deriv-App-ID: <app_id>`
- `Authorization: Bearer <PAT>`

Flow:

1. `GET /trading/v1/options/accounts`
2. pick the target account
3. `POST /trading/v1/options/accounts/{accountId}/otp`
4. connect to returned WebSocket URL
5. send authenticated WebSocket requests like `balance`, `portfolio`, `profit_table`, `buy`

## API Calls To Use

### `active_symbols`

Purpose:

- fetch all tradable symbols / instruments

Use it at app startup to populate the symbol picker.

Example request:

```json
{
  "active_symbols": "brief",
  "req_id": 1
}
```

### `ticks`

Purpose:

- subscribe to real-time price updates for one symbol

Use it for the live quote and price movement in the game.

Example request:

```json
{
  "ticks": "1HZ100V",
  "subscribe": 1,
  "req_id": 2
}
```

### `ticks_history`

Purpose:

- fetch recent historical prices for chart rendering

Use it to preload chart candles/ticks before the live stream takes over.

Example request:

```json
{
  "ticks_history": "1HZ100V",
  "count": 100,
  "end": "latest",
  "style": "ticks",
  "req_id": 3
}
```

### `contracts_for`

Purpose:

- discover available contract types and duration rules for a symbol

Use it to decide which game actions are valid for each symbol.

Example request:

```json
{
  "contracts_for": "1HZ100V",
  "req_id": 4
}
```

### `proposal`

Purpose:

- request price/profit information for a contract setup

Use this only if the game wants Deriv-like quote logic rather than fully custom payout rules.

Example request:

```json
{
  "proposal": 1,
  "amount": 10,
  "basis": "stake",
  "contract_type": "MULTDOWN",
  "currency": "USD",
  "duration_unit": "s",
  "multiplier": 40,
  "underlying_symbol": "1HZ100V",
  "req_id": 5
}
```

## Important Runtime Notes

These were observed during live testing and should be respected in implementation:

- `active_symbols` rejected `product_type` on the current public endpoint
- `contracts_for` rejected `currency` on the current public endpoint
- multiplier `10` was rejected for the tested proposal; accepted values included `40,100,200,300,400`

So implementation should:

- keep payloads minimal
- not assume older examples in docs still match runtime exactly
- handle validation errors gracefully

## Trading App Architecture

### V1 architecture

Use this split:

- frontend
  - symbol picker
  - live price panel
  - chart
  - fake trade controls
  - open positions
  - wallet / score / PnL
- backend or local game engine
  - WebSocket connection manager
  - market data cache
  - game state
  - position settlement
  - leaderboard / persistence

If the app is single-user only, the first version can keep game state local.

If the app is multiplayer, move game state and settlement to a backend.

## Trading Game Logic Recommendation

Do not place real Deriv trades for V1.

Instead:

1. start player with virtual balance
2. let player choose symbol and direction
3. record entry price from latest tick
4. apply game duration and stake rules
5. settle against later tick price
6. update virtual PnL and score

This gives a clean paper-trading experience without requiring real account actions.

## V1 Scope

Recommended V1 features:

- symbol selector
- live quote stream
- recent price chart
- buy up / buy down game action
- open and settled positions
- virtual balance
- PnL history

Recommended V1 Deriv API surface:

- `active_symbols`
- `ticks`
- `ticks_history`
- `contracts_for`

Optional:

- `proposal`

## Phase Plan

### Phase 1: Market data layer

Implement a Deriv WebSocket client for:

- connect
- reconnect
- subscribe/unsubscribe
- route messages by `req_id`
- cache latest tick per symbol

Deliverable:

- stable market-data service

### Phase 2: Chart + symbol browsing

Implement:

- symbol list from `active_symbols`
- chart preload from `ticks_history`
- live updates from `ticks`

Deliverable:

- working market watch + chart UI

### Phase 3: Game engine

Implement:

- virtual wallet
- create fake trades
- duration handling
- settlement rules
- PnL calculation

Deliverable:

- playable paper-trading loop

### Phase 4: Persistence

Implement:

- save balances
- save open/closed positions
- save session history
- optional leaderboard

Deliverable:

- durable player state

### Phase 5: Optional real-account integration

Only if needed later:

- keep PAT on backend only
- call REST account endpoints
- request OTP
- use authenticated WebSocket for account-linked features

Deliverable:

- optional real Deriv account features without exposing secrets

## Security Constraints

- never expose PAT in the frontend
- never commit PAT or secrets to version control
- do not log tokens
- if authenticated features are added later, proxy them through a backend

## Bottom Line

For the trading app, Deriv public WebSocket APIs are enough for V1.

Build the app around:

- `active_symbols`
- `ticks`
- `ticks_history`
- `contracts_for`

Use `proposal` only if we want Deriv-style quote behavior.

Keep all actual trading and account auth out of scope until the game loop is complete.
