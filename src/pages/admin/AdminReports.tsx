import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

interface Report {
  id: string;
  title: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_leads: number;
  roi_percentage: number;
  status: "draft" | "published" | string;
  client_name?: string;
  campaign_name?: string;
  [key: string]: any;
}

// Static data
const STATIC_REPORTS: Report[] = [
  {
    id: "1",
    title: "Q1 2024 Performance Report",
    period_start: "2024-01-01",
    period_end: "2024-03-31",
    total_revenue: 125000,
    total_leads: 3450,
    roi_percentage: 28.5,
    status: "published",
    client_name: "TechCorp Solutions",
    campaign_name: "Spring Launch",
  },
  {
    id: "2",
    title: "February Monthly Report",
    period_start: "2024-02-01",
    period_end: "2024-02-29",
    total_revenue: 42000,
    total_leads: 1200,
    roi_percentage: 15.2,
    status: "published",
    client_name: "Marketing Pro",
    campaign_name: "Valentine's Campaign",
  },
  {
    id: "3",
    title: "Q4 2023 Annual Summary",
    period_start: "2023-10-01",
    period_end: "2023-12-31",
    total_revenue: 98000,
    total_leads: 2800,
    roi_percentage: 22.8,
    status: "draft",
    client_name: "BrandFlow Inc",
    campaign_name: "Holiday Special",
  },
  {
    id: "4",
    title: "March Campaign Report",
    period_start: "2024-03-01",
    period_end: "2024-03-31",
    total_revenue: 56000,
    total_leads: 1650,
    roi_percentage: 18.9,
    status: "draft",
    client_name: "SocialBoost",
    campaign_name: "Spring Forward",
  },
  {
    id: "5",
    title: "January Kickoff Report",
    period_start: "2024-01-01",
    period_end: "2024-01-31",
    total_revenue: 38000,
    total_leads: 980,
    roi_percentage: 12.4,
    status: "published",
    client_name: "Digital Nexus",
    campaign_name: "New Year Campaign",
  },
  {
    id: "6",
    title: "Influencer ROI Analysis",
    period_start: "2024-02-15",
    period_end: "2024-03-15",
    total_revenue: 75000,
    total_leads: 2100,
    roi_percentage: 32.1,
    status: "draft",
    client_name: "TechCorp Solutions",
    campaign_name: "Influencer Partnership",
  },
];

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const loadReports = async (): Promise<void> => {
    // Simulate API loading delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return static data
    setReports(STATIC_REPORTS);
    setLoading(false);
  };

  const handlePublish = async (id: string): Promise<void> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update the report status in static data
    const updatedReports = reports.map((report) =>
      report.id === id ? { ...report, status: "published" } : report,
    );
    setReports(updatedReports);

    toast({ title: "Report published!" });
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight">
          All Reports
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and publish client reports
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No reports yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Period
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Revenue
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Leads
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    ROI
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">{report.title}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {moment(report.period_start).format("MMM D")} -{" "}
                      {moment(report.period_end).format("MMM D, YYYY")}
                    </td>
                    <td className="px-4 py-3">
                      ${(report.total_revenue || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {(report.total_leads || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{report.roi_percentage || 0}%</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          report.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {report.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {report.status === "draft" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-xs"
                          onClick={() => handlePublish(report.id)}
                        >
                          Publish
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
