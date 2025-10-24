"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface StorageSetupGuideProps {
  bucketName: string;
  onRetry: () => void;
}

export default function StorageSetupGuide({ bucketName, onRetry }: StorageSetupGuideProps) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const projectRef = supabaseUrl?.split("//")[1]?.split(".")[0];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("In Zwischenablage kopiert!");
  };

  const policies = [
    {
      name: "SELECT Policy (Lesen)",
      sql: `CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = '${bucketName}');`,
    },
    {
      name: "INSERT Policy (Hochladen)",
      sql: `CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = '${bucketName}');`,
    },
    {
      name: "UPDATE Policy (Aktualisieren)",
      sql: `CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]);`,
    },
    {
      name: "DELETE Policy (Löschen)",
      sql: `CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]);`,
    },
  ];

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Storage-Bucket nicht gefunden</AlertTitle>
        <AlertDescription>
          Der Bucket <code className="bg-muted px-2 py-1 rounded">{bucketName}</code> existiert nicht in deinem Supabase Projekt.
          Folge den Schritten unten, um ihn zu erstellen.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
            Bucket erstellen
          </CardTitle>
          <CardDescription>Erstelle den Storage-Bucket in deinem Supabase Dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              Öffne dein{" "}
              <a
                href={`https://supabase.com/dashboard/project/${projectRef}/storage/buckets`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Supabase Dashboard - Storage
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Klicke auf <strong>"New Bucket"</strong> oder <strong>"Create Bucket"</strong></li>
            <li>
              Gib als Name ein:{" "}
              <code className="bg-muted px-2 py-1 rounded font-mono relative inline-flex items-center gap-2">
                {bucketName}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => copyToClipboard(bucketName)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </code>
            </li>
            <li>Wähle <strong>"Public"</strong> (empfohlen für einfachere Verwaltung)</li>
            <li>Klicke auf <strong>"Create Bucket"</strong></li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
            Storage Policies einrichten
          </CardTitle>
          <CardDescription>Erlaube authentifizierten Nutzern den Zugriff auf den Bucket</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gehe zu deinem Bucket → Tab <strong>"Policies"</strong> → <strong>"New Policy"</strong> und erstelle folgende Policies:
          </p>

          <div className="space-y-3">
            {policies.map((policy, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    {policy.name}
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(policy.sql)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Kopieren
                  </Button>
                </div>
                <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                  {policy.sql}
                </pre>
              </div>
            ))}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Tipp:</strong> Du kannst auch im Supabase Dashboard auf "Create policy from template" klicken
              und die Templates für "Enable read access" und "Enable insert access" verwenden.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
            Fertig!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Nachdem du den Bucket und die Policies erstellt hast, klicke auf "Erneut versuchen".
          </p>
          <Button onClick={onRetry} className="w-full">
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}