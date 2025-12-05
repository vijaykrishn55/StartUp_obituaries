import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const FailureReportDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["failure-report", id],
    queryFn: () => api.getFailureReportById(id as string),
    enabled: !!id,
  });

  const addComment = useMutation({
    mutationFn: () => api.addFailureComment(id as string, comment),
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["failure-report", id] });
      toast({ title: "Comment added" });
    },
    onError: (e: any) => toast({ title: "Failed to comment", description: e?.message ?? "", variant: "destructive" })
  });

  const toggleHelpful = useMutation({
    mutationFn: () => api.markFailureHelpful(id as string),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["failure-report", id] })
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !data) return <div className="p-6">Failed to load report.</div>;

  // data is the report document
  const report: any = data;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{report.startupName}</h1>
        <p className="text-muted-foreground">{report.industry} • {new Date(report.failureDate).toLocaleDateString()} • {report.location?.city}, {report.location?.country}</p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>Team size: {report.teamSize}</span>
          <span>Operational months: {report.operationalMonths}</span>
          {typeof report.fundingRaised === 'number' && <span>Funding: ${report.fundingRaised.toLocaleString()}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleHelpful.mutate()}>
            Helpful ({Array.isArray(report.helpful) ? report.helpful.length : (report.helpful || 0)})
          </Button>
          <span className="text-sm text-muted-foreground">Views: {report.views ?? 0}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Primary Reason</h2>
        <p className="p-4 rounded-md bg-muted">{report.primaryReason}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Detailed Analysis</h2>
        <p className="leading-7 whitespace-pre-wrap">{report.detailedAnalysis}</p>
      </div>

      {Array.isArray(report.lessonsLearned) && report.lessonsLearned.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Lessons Learned</h3>
          <ul className="list-disc pl-6 space-y-1">
            {report.lessonsLearned.map((l: string, i: number) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(report.mistakes) && report.mistakes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Mistakes</h3>
          <ul className="list-disc pl-6 space-y-1">
            {report.mistakes.map((m: string, i: number) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Comments</h2>
        <div className="space-y-3">
          {Array.isArray(report.comments) && report.comments.length > 0 ? (
            report.comments.map((c: any) => (
              <div key={c._id} className="p-3 rounded-md border">
                <div className="text-sm font-medium">{c.user?.name ?? "Anonymous"}</div>
                <div className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
                <p className="mt-1">{c.text}</p>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No comments yet.</div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); if (comment.trim()) addComment.mutate(); }}
          className="space-y-2"
        >
          <Textarea
            placeholder="Add a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={addComment.isPending || comment.trim().length === 0}>Post Comment</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FailureReportDetail;
