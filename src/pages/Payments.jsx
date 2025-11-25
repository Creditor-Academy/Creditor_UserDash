import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function Payments() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Demo data – replace with API once available
  const transactions = useMemo(() => [
    { id: 1, date: "2025-10-02", description: "Credits Purchased", type: "credit", amount: +10000, balance: 12000 },
    { id: 2, date: "2025-10-05", description: "Consultation (30 mins)", type: "debit", amount: -1000, balance: 11000 },
    { id: 3, date: "2025-10-10", description: "Website Service (Basic)", type: "debit", amount: -750, balance: 10250 },
    { id: 4, date: "2025-11-02", description: "Refund", type: "refund", amount: +750, balance: 11000 },
    { id: 5, date: "2025-11-14", description: "Assessment Attempt", type: "debit", amount: -200, balance: 10800 },
  ], []);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesQuery = query
        ? (t.description.toLowerCase().includes(query.toLowerCase()))
        : true;
      const matchesType = type === "all" ? true : t.type === type;
      const afterFrom = dateFrom ? (new Date(t.date) >= new Date(dateFrom)) : true;
      const beforeTo = dateTo ? (new Date(t.date) <= new Date(dateTo)) : true;
      return matchesQuery && matchesType && afterFrom && beforeTo;
    });
  }, [transactions, query, type, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
          <p className="text-gray-600 text-sm">Payment and credit history, plus your before-and-after credit report snapshot.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDown size={16} />
          Export
        </Button>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">Payment & Credit History</TabsTrigger>
          <TabsTrigger value="report">My Credit Report</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  placeholder="Search description..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credits Added</SelectItem>
                    <SelectItem value="debit">Credits Deducted</SelectItem>
                    <SelectItem value="refund">Refunds</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount (cr)</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                        <TableCell className="min-w-[220px]">{t.description}</TableCell>
                        <TableCell>
                          <span className={
                            t.type === "credit" ? "text-emerald-600" : t.type === "refund" ? "text-blue-600" : "text-rose-600"
                          }>
                            {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className={"text-right " + (t.amount >= 0 ? "text-emerald-700" : "text-rose-700")}>
                          {t.amount >= 0 ? `+${t.amount}` : t.amount}
                        </TableCell>
                        <TableCell className="text-right">{t.balance}</TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">No transactions found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Before</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Credit Score" value="580" tone="before" />
                  <Metric label="Utilization" value="62%" tone="before" />
                  <Metric label="On-time Payments" value="78%" tone="before" />
                  <Metric label="Derogatories" value="3" tone="before" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">After</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Credit Score" value="705" tone="after" />
                  <Metric label="Utilization" value="18%" tone="after" />
                  <Metric label="On-time Payments" value="98%" tone="after" />
                  <Metric label="Derogatories" value="0" tone="after" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Metric({ label, value, tone }) {
  const toneClass = tone === "after"
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
