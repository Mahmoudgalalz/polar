import Banner from '@/components/Banner/Banner'
import Icon from '@/components/Icons/Icon'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { ACCOUNT_TYPE_DISPLAY_NAMES, ACCOUNT_TYPE_ICON } from 'polarkit/account'
import { api } from 'polarkit/api'
import {
  AccountRead,
  Organization,
  AccountType,
  Platforms,
  PledgeResources,
  PledgeState,
} from 'polarkit/api/client'
import { PrimaryButton } from 'polarkit/components/ui'
import { getCentsInDollarString } from 'polarkit/money'
import { classNames } from 'polarkit/utils'
import { useState } from 'react'
import SetupAccount from '../Dashboard/SetupAccount'
import { Modal as ModernModal } from '../Modal'
import List from './List'

const Finance = (props: {
  org: Organization
  tab: 'current' | 'rewarded'
  pledges: PledgeResources[]
  accounts: AccountRead[]
}) => {
  const { org, tab, pledges, accounts } = props

  const refundedStates = [PledgeState.REFUNDED, PledgeState.CHARGE_DISPUTED]
  const inReviewStates = [
    PledgeState.CONFIRMATION_PENDING,
    PledgeState.DISPUTED,
    PledgeState.PENDING,
  ]
  const paidStates = [PledgeState.PAID]

  const currentPledges =
    pledges.filter((pr) => pr.pledge.state !== PledgeState.PAID) || []

  const currentPledgesAmount = currentPledges
    .filter((pr) => !refundedStates.includes(pr.pledge.state))
    .map((pr) => pr.pledge.amount)
    .reduce((a, b) => a + b, 0)

  const rewardedPledges =
    pledges.filter((pr) => pr.pledge.state === PledgeState.PAID) || []

  const rewardedPledgesAmount = rewardedPledges
    .map((pr) => pr.pledge.amount)
    .reduce((a, b) => a + b, 0)

  const tabPledges = tab === 'current' ? currentPledges : rewardedPledges

  const openIssues = tabPledges.filter(
    (pr) =>
      !paidStates.includes(pr.pledge.state) &&
      !refundedStates.includes(pr.pledge.state) &&
      !inReviewStates.includes(pr.pledge.state),
  )

  const refunded = tabPledges.filter((pr) =>
    refundedStates.includes(pr.pledge.state),
  )

  const inReview = tabPledges.filter((pr) =>
    inReviewStates.includes(pr.pledge.state),
  )

  const paid = tabPledges.filter((pr) => paidStates.includes(pr.pledge.state))

  return (
    <div className="flex flex-col space-y-8">
      <AccountBanner org={org} accounts={accounts} />

      <div className="flex space-x-8">
        <HeaderPill
          title="Current pledges"
          amount={currentPledgesAmount}
          active={props.tab === 'current'}
          href={`/finance/${org.name}`}
        />
        <HeaderPill
          title={`Rewarded to ${org.name}`}
          amount={rewardedPledgesAmount}
          active={props.tab === 'rewarded'}
          href={`/finance/${org.name}/rewarded`}
        />
        {false && (
          <HeaderPill
            title="Rewarded to contributors"
            amount={0}
            active={false}
            href={`/finance/${org.name}/contributors`}
          />
        )}
      </div>
      {paid.length > 0 && (
        <List
          pledges={paid}
          columns={['PAID_OUT_DATE']}
          title="Paid out"
          subtitle="Issue solved"
        />
      )}
      {inReview.length > 0 && (
        <List
          pledges={inReview}
          columns={['ESTIMATED_PAYOUT_DATE']}
          title="In review"
          subtitle="Issue solved"
        />
      )}
      {openIssues.length > 0 && (
        <List
          pledges={openIssues}
          columns={[]}
          title="Pledges on open issues"
          subtitle="Issue"
        />
      )}
      {refunded.length > 0 && (
        <List
          pledges={refunded}
          columns={['REFUNDED_DATE']}
          title="Refunds"
          subtitle="Issue"
        />
      )}
    </div>
  )
}

const HeaderPill = (props: {
  title: string
  amount: number
  active: boolean
  href: string
}) => {
  return (
    <Link
      href={props.href}
      className={classNames(
        props.active
          ? ' bg-white shadow dark:bg-gray-800 dark:ring-1 dark:ring-gray-700'
          : ' dark:bg-gray-950 border bg-transparent hover:bg-gray-100/50 dark:ring-1 dark:ring-gray-700 dark:hover:bg-gray-800/50',
        'transition-background relative flex w-full max-w-[300px] flex-col rounded-xl py-4  px-5 duration-200',
      )}
    >
      <div className=" text-md flex-1 font-medium text-gray-500 dark:text-gray-400">
        {props.title}
      </div>
      <div className="text-3xl font-medium text-gray-900 dark:text-gray-200">
        ${getCentsInDollarString(props.amount, true)}
      </div>
      {props.active && (
        <>
          <Triangle />
          <div className="absolute left-1/2 bottom-0 -ml-6 h-2 w-12  bg-white dark:bg-gray-800"></div>
        </>
      )}
    </Link>
  )
}

export default Finance

const Triangle = () => (
  <svg
    width="27"
    height="15"
    viewBox="0 0 27 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute -bottom-[12px] left-1/2 -ml-[14px] text-white drop-shadow filter dark:text-gray-800 dark:drop-shadow-[0_1px_0px_#3E3F42]"
    /*style={{
      filter:
        'drop-shadow(0 1px 8px rgb(0 0 0 / 0.07)) drop-shadow(0 0.5px 2.5px rgb(0 0 0 / 0.16))',
    }}
    */
  >
    <path
      d="M13.6641 15L0.673682 5.39648e-07L26.6544 -1.73166e-06L13.6641 15Z"
      fill="currentColor"
    />
  </svg>
)

const AccountBanner = (props: {
  org: Organization
  accounts: AccountRead[]
}) => {
  const { org, accounts } = props

  const goToDashboard = async (account: AccountRead) => {
    const link = await api.accounts.dashboardLink({
      platform: Platforms.GITHUB,
      orgName: org.name,
      accountId: account.id,
    })
    window.location.href = link.url
  }

  const goToOnboarding = async (account: AccountRead) => {
    const link = await api.accounts.onboardingLink({
      platform: Platforms.GITHUB,
      orgName: org.name,
      accountId: account.id,
    })
    window.location.href = link.url
  }

  const [showSetupModal, setShowSetupModal] = useState(false)

  const toggle = () => {
    setShowSetupModal(!showSetupModal)
  }

  if (accounts.length === 0) {
    return (
      <>
        <Banner
          color="default"
          right={
            <PrimaryButton
              size="small"
              onClick={(e) => {
                e.preventDefault()
                setShowSetupModal(true)
              }}
            >
              <span>Setup</span>
            </PrimaryButton>
          }
        >
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <span className="text-sm">
            You need to set up <strong>Stripe</strong> or <strong>Open Collective</strong> to receive
            payouts
          </span>
        </Banner>
        <ModernModal
          isShown={showSetupModal}
          hide={toggle}
          modalContent={
            <SetupAccount onClose={() => setShowSetupModal(false)} />
          }
        />
      </>
    )
  }

  if (accounts.length > 0 && !accounts[0].is_details_submitted) {
    const AccountTypeIcon = ACCOUNT_TYPE_ICON[accounts[0].account_type];
    return (
      <Banner
        color="default"
        right={
          <PrimaryButton
            size="small"
            onClick={(e) => {
              e.preventDefault()
              goToOnboarding(accounts[0])
            }}
          >
            <span>Continue setup</span>
          </PrimaryButton>
        }
      >
        <Icon classes="bg-blue-500 p-1" icon={<AccountTypeIcon />} />
        <span className="text-sm">
          Continue the setup of your <strong>{ACCOUNT_TYPE_DISPLAY_NAMES[accounts[0].account_type]}</strong> account to receive
          payouts
        </span>
      </Banner>
    )
  }

  if (accounts.length > 0 && accounts[0].is_details_submitted) {
    const accountType = accounts[0].account_type;
    const AccountTypeIcon = ACCOUNT_TYPE_ICON[accountType];
    return (
      <>
        <Banner
          color="muted"
          right={
            <>
              {accounts[0].is_admin && (
                <button
                  className="font-medium text-blue-500 dark:text-blue-400"
                  onClick={(e) => {
                    e.preventDefault()
                    goToDashboard(accounts[0])
                  }}
                >
                  Go to {ACCOUNT_TYPE_DISPLAY_NAMES[accountType]}
                </button>
              )}
              {!accounts[0].is_admin && (
                <span className="text-gray-400">
                  Ask the admin to make changes
                </span>
              )}
            </>
          }
        >
          <Icon classes="bg-blue-500 p-1" icon={<AccountTypeIcon />} />
          <span className="text-sm">
            {accountType === AccountType.STRIPE && 'Payouts will be sent to the connected Stripe account'}
            {accountType === AccountType.OPEN_COLLECTIVE && 'Payouts will be sent in bulk once per month to the connected Open Collective account'}
          </span>
        </Banner>
      </>
    )
  }

  return null
}
