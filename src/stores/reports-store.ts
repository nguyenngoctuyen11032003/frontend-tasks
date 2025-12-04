import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  reportsService,
  type GenerateReportRequest,
  type GenerateReportResponse,
  type GetChartDataRequest,
  type ChartDataResponse,
  type StatisticsResponse,
  ReportsApiError,
} from '@/services/reports.service';

/**
 * Reports Store State
 */
interface ReportsState {
  // Data state
  reports: GenerateReportResponse[];
  chartData: ChartDataResponse[];
  statistics: StatisticsResponse | null;
  teamPerformance: any[];
  projectsStatistics: any[];

  // Filter state
  filters: {
    startDate: string;
    endDate: string;
    projectId?: string;
    userId?: string;
  };

  // UI state
  loading: boolean;
  error: string | null;
  selectedReportType?: string;

  // Actions
  fetchStatistics: () => Promise<void>;
  fetchChartData: (type?: string) => Promise<void>;
  fetchAllChartData: () => Promise<void>;
  fetchTeamPerformance: () => Promise<void>;
  fetchProjectsStatistics: () => Promise<void>;
  generateReport: (request: GenerateReportRequest) => Promise<GenerateReportResponse>;
  setFilters: (filters: Partial<ReportsState['filters']>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Default filters
 */
const getDefaultFilters = () => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  return {
    startDate: startOfYear.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  };
};

/**
 * Zustand Reports Store
 */
export const useReportsStore = create<ReportsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      reports: [],
      chartData: [],
      statistics: null,
      teamPerformance: [],
      projectsStatistics: [],
      filters: getDefaultFilters(),
      loading: false,
      error: null,
      selectedReportType: undefined,

      /**
       * Fetch overall statistics
       */
      fetchStatistics: async () => {
        try {
          set({ loading: true, error: null });

          const statistics = await reportsService.getStatistics();
          set({ statistics, loading: false });
        } catch (error) {
          const errorMessage =
            error instanceof ReportsApiError
              ? error.message
              : 'Failed to fetch statistics';

          set({
            error: errorMessage,
            loading: false,
          });

          // Re-throw for caller to handle
          throw error;
        }
      },

      /**
       * Fetch chart data for specific type or all types
       */
      fetchChartData: async (type?: string) => {
        try {
          set({ loading: true, error: null });

          const filters = get().filters;
          const request: GetChartDataRequest = {
            type: type as any,
            startDate: filters.startDate,
            endDate: filters.endDate,
            projectId: filters.projectId,
            userId: filters.userId,
          };

          const chartData = await reportsService.getChartData(request);

          // Append to existing chart data or replace if it's the same type
          set((state) => ({
            chartData: state.chartData.some((c) => c.type === chartData.type)
              ? state.chartData.map((c) => (c.type === chartData.type ? chartData : c))
              : [...state.chartData, chartData],
            loading: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof ReportsApiError
              ? error.message
              : 'Failed to fetch chart data';

          set({
            error: errorMessage,
            loading: false,
          });

          throw error;
        }
      },

      /**
       * Fetch all 5 chart types in parallel
       */
      fetchAllChartData: async () => {
        try {
          set({ loading: true, error: null });

          const filters = get().filters;
          const allChartData = await reportsService.getAllChartData(
            filters.startDate,
            filters.endDate,
          );

          set({
            chartData: allChartData,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof ReportsApiError
              ? error.message
              : 'Failed to fetch chart data';

          set({
            error: errorMessage,
            loading: false,
          });

          throw error;
        }
      },

      /**
       * Fetch team performance data
       */
      fetchTeamPerformance: async () => {
        try {
          set({ loading: true, error: null });

          const { startDate, endDate } = get().filters;
          const teamPerformance = await reportsService.getTeamPerformance(startDate, endDate);

          set({
            teamPerformance,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof ReportsApiError
              ? error.message
              : 'Failed to fetch team performance';

          set({
            error: errorMessage,
            loading: false,
          });

          throw error;
        }
      },

      /**
       * Fetch projects statistics
       */
      fetchProjectsStatistics: async () => {
        try {
          set({ loading: true, error: null });

          const { startDate, endDate } = get().filters;
          const projectsStatistics = await reportsService.getProjectsStatistics(startDate, endDate);

          set({
            projectsStatistics,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof ReportsApiError
              ? error.message
              : 'Failed to fetch projects statistics';

          set({
            error: errorMessage,
            loading: false,
          });

          throw error;
        }
      },

      /**
       * Generate a report
       */
      generateReport: async (request: GenerateReportRequest) => {
        try {
          set({ loading: true, error: null });

          const report = await reportsService.generateReport(request);

          set((state) => ({
            reports: [...state.reports, report],
            loading: false,
            selectedReportType: request.type,
          }));

          return report;
        } catch (error) {
          const errorMessage =
            error instanceof ReportsApiError
              ? error.message
              : 'Failed to generate report';

          set({
            error: errorMessage,
            loading: false,
          });

          throw error;
        }
      },

      /**
       * Update filters and clear chart data (will need to refetch)
       */
      setFilters: (newFilters: Partial<ReportsState['filters']>) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
          // Reset chart data when filters change - will need to refetch
          chartData: [],
        }));
      },

      /**
       * Set loading state
       */
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      /**
       * Set error message
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Reset all state to initial values
       */
      reset: () => {
        set({
          reports: [],
          chartData: [],
          statistics: null,
          teamPerformance: [],
          projectsStatistics: [],
          filters: getDefaultFilters(),
          loading: false,
          error: null,
          selectedReportType: undefined,
        });
      },
    }),
    {
      name: 'reportsStore',
      enabled: true,
    },
  ),
);
