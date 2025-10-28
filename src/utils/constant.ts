import bcrypt from 'bcrypt';

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

export { hashPassword, isPasswordSame, adminRoleId, adminRole };
