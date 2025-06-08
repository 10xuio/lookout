import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Eye,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  BarChart3,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  getDashboardData,
  type TopCompetitor,
  type RecentAlert,
  type ModelPerformance,
} from "./actions";
import { cn } from "@/lib/utils";

function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <div
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-in-out rounded-full"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

const formatValue = (
  val: number,
  format: "number" | "percentage" | "score"
) => {
  switch (format) {
    case "percentage":
      return `${val}%`;
    case "score":
      return `${val}/100`;
    default:
      return val.toLocaleString();
  }
};

const trendStyles = {
  up: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: ArrowUpRight,
  },
  down: {
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: ArrowDownRight,
  },
  neutral: {
    color: "text-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    icon: Target,
  },
};

function KPICard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  format = "number",
}: {
  title: string;
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  format?: "number" | "percentage" | "score";
}) {
  const styles = trendStyles[trend];
  const TrendIcon = styles.icon;

  return (
    <Card className="relative overflow-hidden shadow-none bg-white gap-2">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600 tracking-wide">
            {title}
          </CardTitle>
          <div className="p-2 bg-slate-50 rounded-lg">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-3xl font-bold text-slate-900 tracking-tight">
            {formatValue(value, format)}
          </div>
          <div
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
              styles.bg,
              styles.border,
              styles.color,
              "border"
            )}
          >
            <TrendIcon className="h-3 w-3 mr-1" />
            {Math.abs(change)}% from last month
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BrandHealthCard({
  brandHealth,
}: {
  brandHealth: { positive: number; neutral: number; negative: number };
}) {
  const { positive, neutral, negative } = brandHealth;

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          Brand Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-4">
          <div className="text-4xl font-bold text-emerald-600 mb-2">
            {positive}%
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Overall Positive Sentiment
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">
                  Positive
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {positive}%
              </span>
            </div>
            <Progress value={positive} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">
                  Neutral
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {neutral}%
              </span>
            </div>
            <div className="bg-slate-100 rounded-full overflow-hidden h-2">
              <div
                className="bg-slate-400 h-full transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${neutral}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">
                  Negative
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {negative}%
              </span>
            </div>
            <div className="bg-slate-100 rounded-full overflow-hidden h-2">
              <div
                className="bg-red-500 h-full transition-all duration-500 ease-in-out rounded-full"
                style={{ width: `${negative}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompetitorItem({
  competitor,
  rank,
}: {
  competitor: TopCompetitor;
  rank: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center border justify-between p-3 bg-slate-50 rounded-lg",
        "hover:bg-slate-100 transition-colors duration-150"
      )}
    >
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className="w-7 h-7 p-0 flex items-center justify-center border-slate-300 text-slate-600"
        >
          {rank}
        </Badge>
        <div>
          <p className="font-medium text-slate-900">{competitor.name}</p>
          <p className="text-sm text-slate-500">
            {competitor.mentions.toLocaleString()} mentions
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-slate-900">
          {competitor.sentiment}%
        </div>
        <div className="text-xs text-slate-500 uppercase tracking-wide">
          sentiment
        </div>
      </div>
    </div>
  );
}

function CompetitorAnalysisCard({
  competitors,
  brandMentions,
  visibilityScore,
}: {
  competitors: TopCompetitor[];
  brandMentions: number;
  visibilityScore: number;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Trophy className="h-5 w-5 text-amber-600" />
          </div>
          Competitive Positioning
        </CardTitle>
        <CardDescription className="text-slate-500">
          How you rank against top competitors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Your Brand - Highlighted */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="w-7 h-7 p-0 flex items-center justify-center bg-blue-600 hover:bg-blue-600">
                1
              </Badge>
              <div>
                <p className="font-semibold text-slate-900">Your Brand</p>
                <p className="text-sm text-blue-600 font-medium">
                  {brandMentions} mentions
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-blue-600">
                {visibilityScore}%
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">
                sentiment
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {competitors.map((competitor, index) => (
            <CompetitorItem
              key={competitor.name}
              competitor={competitor}
              rank={index + 2}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const alertStyles = {
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  info: {
    icon: Target,
    iconColor: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
};

function AlertItem({ alert }: { alert: RecentAlert }) {
  const styles = alertStyles[alert.type];
  const Icon = styles.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border ${styles.bg} ${styles.border}`}
    >
      <div className="p-1">
        <Icon className={`h-4 w-4 ${styles.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 leading-5">
          {alert.message}
        </p>
        <p className="text-xs text-slate-500 mt-1 font-medium">{alert.time}</p>
      </div>
    </div>
  );
}

function AlertsCard({ alerts }: { alerts: RecentAlert[] }) {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Zap className="h-5 w-5 text-purple-600" />
          </div>
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <AlertItem key={index} alert={alert} />
        ))}
      </CardContent>
    </Card>
  );
}

function ModelCard({
  model,
  data,
}: {
  model: string;
  data: ModelPerformance[string];
}) {
  return (
    <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white rounded-lg">
          <Bot className="h-4 w-4 text-slate-600" />
        </div>
        <h4 className="font-semibold text-slate-900 capitalize">
          {model.replace("gpt4", "GPT-4")}
        </h4>
      </div>

      <div className="space-y-4">
        <MetricRow label="Mentions" value={data.mentions.toLocaleString()} />
        <MetricRow
          label="Visibility"
          value={`${data.visibilityScore}%`}
          progress={data.visibilityScore}
        />
        <MetricRow
          label="Sentiment"
          value={`${data.sentiment}%`}
          sentiment={data.sentiment}
        />
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  progress,
  sentiment,
}: {
  label: string;
  value: string;
  progress?: number;
  sentiment?: number;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-600">{label}</span>
        <span
          className={cn(
            "font-semibold",
            sentiment && {
              "text-emerald-600": sentiment > 65,
              "text-amber-600": sentiment > 55 && sentiment <= 65,
              "text-red-500": sentiment <= 55,
            }
          )}
        >
          {value}
        </span>
      </div>
      {progress !== undefined && <Progress value={progress} className="h-2" />}
    </div>
  );
}

function ModelPerformanceCard({
  modelPerformance,
}: {
  modelPerformance: ModelPerformance;
}) {
  const models = Object.entries(modelPerformance);

  return (
    <Card className="col-span-full shadow-none">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Bot className="h-5 w-5 text-indigo-600" />
          </div>
          AI Model Performance
        </CardTitle>
        <CardDescription className="text-slate-500">
          Brand visibility across different AI engines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {models.map(([model, data]) => (
            <ModelCard key={model} model={model} data={data} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export async function DashboardOverview({ topicId }: { topicId: string }) {
  const data = await getDashboardData(topicId);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Brand Mentions"
          value={data.kpis.totalBrandMentions.value}
          change={data.kpis.totalBrandMentions.change}
          trend={data.kpis.totalBrandMentions.trend}
          icon={Eye}
        />
        <KPICard
          title="Visibility Score"
          value={data.kpis.visibilityScore.value}
          change={data.kpis.visibilityScore.change}
          trend={data.kpis.visibilityScore.trend}
          icon={BarChart3}
          format="percentage"
        />
        <KPICard
          title="Competitor Gap"
          value={data.kpis.competitorGap.value}
          change={data.kpis.competitorGap.change}
          trend={data.kpis.competitorGap.trend}
          icon={Trophy}
          format="percentage"
        />
        <KPICard
          title="AI Engines"
          value={data.kpis.aiEnginesTracked.value}
          change={data.kpis.aiEnginesTracked.change}
          trend={data.kpis.aiEnginesTracked.trend}
          icon={Bot}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BrandHealthCard brandHealth={data.brandHealth} />
        <CompetitorAnalysisCard
          competitors={data.topCompetitors}
          brandMentions={data.kpis.totalBrandMentions.value}
          visibilityScore={data.kpis.visibilityScore.value}
        />
        <AlertsCard alerts={data.recentAlerts} />
      </div>

      <ModelPerformanceCard modelPerformance={data.modelPerformance} />
    </div>
  );
}
