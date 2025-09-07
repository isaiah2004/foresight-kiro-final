import {
  BarChart3,
  Calculator,
  CreditCard,
  DollarSign,
  Home,
  PiggyBank,
  Settings,
  TrendingUp,
  Wallet,
  Target,
  MessageSquare,
  LifeBuoy,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  isActive?: boolean;
  items?: Array<{
    title: string;
    url: string;
  }>;
}

export interface NavigationConfig {
  main: NavigationItem[];
  secondary: NavigationItem[];
}

export const navigationConfig: NavigationConfig = {
  main: [
    {
      title: "Overview",
      url: "/dashboard/overview",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Financial Health",
          url: "/dashboard/overview/financial-health",
        },
        {
          title: "Cashflow",
          url: "/dashboard/overview/cashflow",
        },
        {
          title: "Fin Bot",
          url: "/dashboard/overview/fin-bot",
        },
      ],
    },
    {
      title: "Investments",
      url: "/dashboard/investments",
      icon: TrendingUp,
      items: [
        {
          title: "Stocks",
          url: "/dashboard/investments/stocks",
        },
        {
          title: "Bonds",
          url: "/dashboard/investments/bonds",
        },
        {
          title: "Mutual Funds",
          url: "/dashboard/investments/mutual-funds",
        },
        {
          title: "Real Estate",
          url: "/dashboard/investments/real-estate",
        },
        {
          title: "Crypto",
          url: "/dashboard/investments/crypto",
        },
        {
          title: "Other",
          url: "/dashboard/investments/other",
        },
      ],
    },
    {
      title: "Budgets",
      url: "/dashboard/budgets",
      icon: Calculator,
      items: [
        {
          title: "Income Splitting",
          url: "/dashboard/budgets/income-splitting",
        },
        {
          title: "Buckets",
          url: "/dashboard/budgets/buckets",
        },
        {
          title: "Manage",
          url: "/dashboard/budgets/manage",
        },
      ],
    },
    {
      title: "Income",
      url: "/dashboard/income",
      icon: DollarSign,
      items: [
        {
          title: "Salary",
          url: "/dashboard/income/salary",
        },
        {
          title: "Rental Properties",
          url: "/dashboard/income/rental-properties",
        },
        {
          title: "Others",
          url: "/dashboard/income/others",
        },
      ],
    },
    {
      title: "Expenses",
      url: "/dashboard/expenses",
      icon: CreditCard,
    },
    {
      title: "Loans",
      url: "/dashboard/loans",
      icon: Wallet,
    },
    {
      title: "Funds",
      url: "/dashboard/funds",
      icon: PiggyBank,
      items: [
        {
          title: "Pots",
          url: "/dashboard/funds/pots",
        },
        {
          title: "Saving Funds",
          url: "/dashboard/funds/saving-funds",
        },
        {
          title: "Other",
          url: "/dashboard/funds/other",
        },
      ],
    },
    {
      title: "Insights",
      url: "/dashboard/insights",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
  secondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: MessageSquare,
    },
  ],
};

// Tab navigation configurations for detailed sections
export const tabNavigationConfig = {
  dashboard: [
    { title: "Financial Health", url: "/dashboard/overview/financial-health" },
    { title: "Cashflow", url: "/dashboard/overview/cashflow" },
    { title: "Fin Bot", url: "/dashboard/overview/fin-bot" },
  ],
  investments: [
    { title: "Stocks", url: "/dashboard/investments/stocks" },
    { title: "Bonds", url: "/dashboard/investments/bonds" },
    { title: "Mutual Funds", url: "/dashboard/investments/mutual-funds" },
    { title: "Real Estate", url: "/dashboard/investments/real-estate" },
    { title: "Crypto", url: "/dashboard/investments/crypto" },
    { title: "Other", url: "/dashboard/investments/other" },
  ],
  budgets: [
    { title: "Income Splitting", url: "/dashboard/budgets/income-splitting" },
    { title: "Buckets", url: "/dashboard/budgets/buckets" },
    { title: "Manage", url: "/dashboard/budgets/manage" },
  ],
  income: [
    { title: "Salary", url: "/dashboard/income/salary" },
    { title: "Rental Properties", url: "/dashboard/income/rental-properties" },
    { title: "Others", url: "/dashboard/income/others" },
  ],
  funds: [
    { title: "Pots", url: "/dashboard/funds/pots" },
    { title: "Saving Funds", url: "/dashboard/funds/saving-funds" },
    { title: "Other", url: "/dashboard/funds/other" },
  ],
};