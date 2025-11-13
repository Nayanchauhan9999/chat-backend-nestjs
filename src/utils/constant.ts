import bcrypt from 'bcrypt';
import { IPagination } from 'src/modules/chat/interfaces/chat.interface';

async function hashPassword(
  password: string,
  saltRound: number = 10,
): Promise<string> {
  try {
    return await bcrypt.hash(password, saltRound);
  } catch (error) {
    return JSON.stringify(error);
  }
}

async function isPasswordSame(
  password: string,
  dbPasswords: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, dbPasswords);
  } catch (error) {
    return Boolean(error);
  }
}

// admin get all permissions
const adminRole = {
  dashboard: {
    view: true,
    addValuation: true,
    addLead: true,
    addAccount: true,
    leads: {
      view: true,
      viewWidgets: true,
      addWidgets: true,
      leadsOverview: {
        view: true,
        assignTo: true,
        shareForm: true,
        export: true,
        delete: true,
      },
      charts: {
        yearlyTarget: true,
        leadsFunnel: true,
        top5ValuersByLeadConversion: true,
        monthlyLeadTrends: true,
        top5CitiesByLeadVolume: true,
        leadByPropertyType: true,
        leadLostBreakdownByReason: true,
      },
    },
    valuations: {
      view: true,
      viewWidgets: true,
      addWidgets: true,
      inspection: true,
      valuationsDeadline: true,
      valuationOverview: {
        view: true,
        assignTo: true,
        share: true,
        export: true,
        delete: true,
      },
      charts: {
        yearlyTarget: true,
        leadsFunnel: true,
        To5LeadsByLeadConversion: true,
        monthlyLeadTrend: true,
        top5CitiesByLeadVolume: true,
        leadsByPropertyType: true,
        LeadsLostBreakdownByReason: true,
      },
    },
    valuers: {
      view: true,
      viewWidgets: true,
      addWidgets: true,
      dueValuation: true,
      overdueValuation: true,
      performanceOverview: {
        view: true,
        export: true,
        delete: true,
      },
      chart: {
        top5ValuersByPerformance: true,
        underPerformingValuers: true,
      },
    },
    revenue: {
      view: true,
      viewWidgets: true,
      addWidgets: true,
      invoices: {
        export: true,
        delete: true,
      },
      charts: {
        yearlyTarget: true,
        revenueByPropertyType: true,
        monthlyRevenueValuersVsContractors: true,
        revenueByContractorsIncomeVsExpense: true,
        Top5CitiesByRevenue: true,
      },
    },
  },
  leads: { view: true, leads: {} },
};

const adminRoleId = 'c0f343ad-d9e1-4aab-9f45-9cfa1444872a';

function getPagination({
  pageNo = 1,
  take = 10,
  totalData,
}: {
  totalData: number;
  pageNo?: number;
  take?: number;
}): IPagination {
  const page = +pageNo;
  const totalPages = Math.ceil(totalData / +take);
  const nextPage = page < totalPages ? +page + 1 : null;
  const previousPage = page > 1 ? page - 1 : null;

  return { totalData, page, take: +take, totalPages, nextPage, previousPage };
}

const DEFAULT_DATA_LENGTH = 10;

const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/reset-password',
  '/auth/resend-otp',
];

enum EnvironmentVariablesEnum {
  PORT = 'PORT',
  JWT_SECRET_KEY = 'JWT_SECRET_KEY',
  SMTP_HOST = 'SMTP_HOST',
  SMTP_PORT = 'SMTP_PORT',
  SENT_EMAIL_FROM = 'SENT_EMAIL_FROM',
  ENVIRONMENT = 'ENVIRONMENT',
  SMTP_PASSWORD = 'SMTP_PASSWORD',
  SMTP_USER = 'SMTP_USER',
}

export {
  hashPassword,
  isPasswordSame,
  adminRoleId,
  adminRole,
  getPagination,
  DEFAULT_DATA_LENGTH,
  publicRoutes,
  EnvironmentVariablesEnum,
};
