# Shared Types and Utilities

Shared TypeScript types, utilities, and configurations used across frontend, backend, and other TypeScript packages.

## Features

- 🔧 Common TypeScript types
- 🛠️ Utility functions
- ⚙️ Configuration schemas
- 🔄 API interfaces
- 🎨 Design tokens

## Usage

```typescript
import { Market, User, MarketStatus } from '@oraclex/shared/types';
import { formatPrice, calculateOdds } from '@oraclex/shared/utils';
import { API_ENDPOINTS } from '@oraclex/shared/config';
```

## Types

- `Market` - Prediction market interface
- `User` - User profile and stats
- `Oracle` - Oracle agent information
- `Prediction` - User prediction data
- `Resolution` - Market resolution results