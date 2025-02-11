import { OpenCollective, Stripe } from 'polarkit/components/icons'
import { AccountType } from 'polarkit/api/client'

export const ACCOUNT_TYPES: AccountType[] = Object.values(AccountType)

export const ACCOUNT_TYPE_DISPLAY_NAMES: Record<AccountType, string> = {
  [AccountType.STRIPE]: 'Stripe',
  [AccountType.OPEN_COLLECTIVE]: 'Open Collective',
}

export const ACCOUNT_TYPE_ICON: Record<AccountType, React.FC> = {
  [AccountType.STRIPE]: Stripe,
  [AccountType.OPEN_COLLECTIVE]: OpenCollective,
}
