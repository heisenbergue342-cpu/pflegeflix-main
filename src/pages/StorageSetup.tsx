"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { getJobPhotosBucket } from "@/utils/storage";

export default function StorageSetup() {
  const bucketName = getJobPhotosBucket();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const projectRef = supabaseUrl?.split("//")[1]?.split(".")[0];

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Storage Setup - Anleitung</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Bucket nicht gefunden</AlertTitle>
        <AlertDescription>
          Der Storage-Bucket <code className="bg-muted px-2 py-1 rounded">{bucketName}</code> existiert noch nicht in deinem Supabase Projekt.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Schritt 1: Bucket erstellen</CardTitle>
          <CardDescription>Erstelle den Storage-Bucket in deinem Supabase Dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3">
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
            <li>Klicke auf "New Bucket" oder "Create Bucket"</li>
            <li>
              Name: <code className="bg-muted px-2 py-1 rounded font-mono">{bucketName}</code>
            </li>
            <li>Wähle "Public" (empfohlen) oder "Private"</li>
            <li>Klicke auf "Create Bucket"</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Schritt 2: Storage Policies einrichten</CardTitle>
          <CardDescription>Erlaube authentifizierten Nutzern den Zugriff</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gehe zu deinem Bucket → "Policies" und erstelle folgende Policies:
          </p>
          
          <div className="space-y-3">
            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                SELECT Policy (Lesen)
              </h4>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`CREATE POLICY "Authenticated users can read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = '${bucketName}');`}
              </pre>
            </div>

            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                INSERT Policy (Hochladen)
              </h4>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = '${bucketName}');`}
              </pre>
            </div>

            <div className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                DELETE Policy (Löschen)
              </h4>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
{`CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = '${bucketName}' AND auth.uid()::text = (storage.foldername(name))[1]);`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schritt 3: Testen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Nach dem Erstellen des Buckets und der Policies:
          </p>
          <Button asChild>
            <a href="/employer/post">Zurück zum Job-Posting</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}