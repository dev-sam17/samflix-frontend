"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Scan,
  FolderPlus,
  Folder,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  Settings,
  Activity,
  Star,
} from "lucide-react";
import { api } from "@/lib/api";
import type { MediaFolder, ScanningConflict } from "@/lib/types";
import { ScanProgress } from "./components/ScanProgress";
import {
  useApiWithContext,
  useMutationWithContext,
} from "@/hooks/use-api-with-context";

function AddFolderDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [folderType, setFolderType] = useState("");
  const { toast } = useToast();

  const { mutate: addFolder, loading } = useMutationWithContext(
    (baseUrl: string) => () =>
      api.client.scanner.addFolder(baseUrl, {
        path: folderPath,
        type: folderType as "movies" | "series",
      })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderPath || !folderType) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addFolder({
        path: folderPath,
        type: folderType as "movies" | "series",
      });
      toast({
        title: "Success",
        description: "Media folder added successfully",
      });
      setOpen(false);
      setFolderPath("");
      setFolderType("");
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add media folder",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">
          <FolderPlus className="w-4 h-4 mr-2" />
          Add Media Folder
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Add Media Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="path">Folder Path</Label>
            <Input
              id="path"
              placeholder="/path/to/media/folder"
              value={folderPath}
              onChange={(e) => setFolderPath(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Media Type</Label>
            <Select value={folderType} onValueChange={setFolderType} required>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select media type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="movies">Movies</SelectItem>
                <SelectItem value="series">TV Series</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Folder"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ConflictResolutionDialog({
  conflict,
  onSuccess,
}: {
  conflict: ScanningConflict;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState("");
  const { toast } = useToast();

  const { mutate: resolveConflict, loading } = useMutationWithContext(
    (baseUrl: string) => (params: { id: string; selectedId: number }) =>
      api.client.scanner.resolveConflict(baseUrl, params.id, params.selectedId)
  );

  const handleResolve = async () => {
    if (!selectedMatch) {
      toast({
        title: "Error",
        description: "Please select a match",
        variant: "destructive",
      });
      return;
    }

    try {
      await resolveConflict({
        id: conflict.id,
        selectedId: Number.parseInt(selectedMatch),
      });
      toast({
        title: "Success",
        description: "Conflict resolved successfully",
      });
      setOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve conflict",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
          Resolve
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Resolve Scanning Conflict</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select the correct match for this file to resolve the conflict
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 px-6 py-2 border-b border-gray-800">
          <Button
            onClick={handleResolve}
            disabled={!selectedMatch || loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Resolving..." : "Resolve Conflict"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2 p-6 pt-4">
          <div>
            <Label className="text-sm text-gray-400">File Name</Label>
            <code className="block text-sm bg-gray-800 p-2 rounded text-green-400 break-all">
              {conflict.fileName}
            </code>
          </div>

          <div>
            <Label className="text-sm text-gray-400 mb-3 block">
              Select Correct Match
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conflict.possibleMatches.map((match: any) => (
                <Card
                  key={match.id}
                  className={`cursor-pointer transition-colors h-full ${
                    selectedMatch === match.id.toString()
                      ? "bg-red-600/20 border-red-500"
                      : "bg-gray-800 border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedMatch(match.id.toString())}
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="flex flex-col md:flex-row h-full">
                      <div className="w-full md:w-1/3 relative">
                        {match.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${match.poster_path}`}
                            alt={match.title}
                            className="h-[200px] md:h-full w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                          />
                        ) : (
                          <div className="h-[200px] md:h-full w-full bg-gray-700 flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-t-none">
                            <span className="text-gray-400">No poster</span>
                          </div>
                        )}
                        {selectedMatch === match.id.toString() && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-red-600">Selected</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-white text-lg">
                              {match.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              Released:{" "}
                              {match.release_date || match.year || "Unknown"}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-gray-600 text-gray-300"
                          >
                            ID: {match.id}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mt-1 flex-grow line-clamp-4 md:line-clamp-6">
                          {match.overview}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          {match.vote_average && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm text-gray-300">
                                {match.vote_average.toFixed(1)}/10
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleResolve}
              disabled={!selectedMatch || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Resolving..." : "Resolve Conflict"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ScannerPage() {
  const { toast } = useToast();
  const [showScanProgress, setShowScanProgress] = useState(false);

  // Fetch data
  const {
    data: folders,
    loading: foldersLoading,
    refetch: refetchFolders,
  } = useApiWithContext(
    (baseUrl: string) => () => api.client.scanner.getFolders(baseUrl),
    []
  );
  const {
    data: conflicts,
    loading: conflictsLoading,
    refetch: refetchConflicts,
  } = useApiWithContext(
    (baseUrl: string) => () => api.client.scanner.getConflicts(baseUrl),
    []
  );
  const { data: healthData } = useApiWithContext(
    (baseUrl: string) => () => api.client.system.healthCheck(baseUrl),
    []
  );

  // Mutations
  const { mutate: deleteFolder } = useMutationWithContext(
    (baseUrl: string) => (id: string) =>
      api.client.scanner.deleteFolder(baseUrl, id)
  );
  const { mutate: deleteConflict } = useMutationWithContext(
    (baseUrl: string) => (id: string) =>
      api.client.scanner.deleteConflict(baseUrl, id)
  );
  const { mutate: deleteAllConflicts } = useMutationWithContext(
    (baseUrl: string) => () => api.client.scanner.deleteAllConflicts(baseUrl)
  );
  const { mutate: updateFolder } = useMutationWithContext(
    (baseUrl: string) =>
      (params: { id: string; updates: Partial<MediaFolder> }) =>
        api.client.scanner.updateFolder(baseUrl, params.id, params.updates)
  );

  const handleStartScan = async () => {
    setShowScanProgress(true);
  };

  const handleScanComplete = () => {
    refetchFolders();
    refetchConflicts();
    toast({
      title: "Scan Completed",
      description: "Media scan completed successfully",
    });
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this folder?")) return;

    try {
      await deleteFolder(id);
      toast({
        title: "Success",
        description: "Media folder deleted successfully",
      });
      refetchFolders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const handleToggleFolder = async (folder: MediaFolder) => {
    try {
      await updateFolder({
        id: folder.id,
        updates: { active: !folder.active },
      });
      toast({
        title: "Success",
        description: `Folder ${
          folder.active ? "deactivated" : "activated"
        } successfully`,
      });
      refetchFolders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConflict = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conflict?")) return;

    try {
      await deleteConflict(id);
      toast({
        title: "Success",
        description: "Scanning conflict deleted successfully",
      });
      refetchConflicts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conflict",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllConflicts = async () => {
    if (!confirm("Are you sure you want to delete all conflicts?")) return;

    try {
      await deleteAllConflicts("all");
      toast({
        title: "Success",
        description: "All scanning conflicts deleted successfully",
      });
      refetchConflicts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete conflicts",
        variant: "destructive",
      });
    }
  };

  // Calculate stats
  const totalFolders = folders?.length || 0;
  const activeFolders = folders?.filter((f) => f.active).length || 0;
  const totalConflicts = conflicts?.length || 0;
  const unresolvedConflicts = conflicts?.filter((c) => !c.resolved).length || 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Media Scanner</h1>
          <p className="text-gray-400">
            Manage your media folders and resolve scanning conflicts
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          {!showScanProgress ? (
            <Button
              size="lg"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleStartScan}
            >
              <Scan className="w-5 h-5 mr-2" />
              Start Manual Scan
            </Button>
          ) : null}
          <AddFolderDialog onSuccess={refetchFolders} />
        </div>

        {/* Scan Progress */}
        {showScanProgress && (
          <div className="mb-8">
            <ScanProgress onComplete={handleScanComplete} />
          </div>
        )}

        {/* Scan Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Folder className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {totalFolders}
              </div>
              <div className="text-sm text-gray-400">Total Folders</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {activeFolders}
              </div>
              <div className="text-sm text-gray-400">Active Folders</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {unresolvedConflicts}
              </div>
              <div className="text-sm text-gray-400">Conflicts</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {healthData ? "Online" : "Offline"}
              </div>
              <div className="text-sm text-gray-400">System Status</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="folders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-800">
            <TabsTrigger
              value="folders"
              className="data-[state=active]:bg-red-600"
            >
              Media Folders
            </TabsTrigger>
            <TabsTrigger
              value="conflicts"
              className="data-[state=active]:bg-red-600"
            >
              Conflicts{" "}
              {unresolvedConflicts > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-yellow-600 text-white"
                >
                  {unresolvedConflicts}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="folders" className="mt-6">
            <div className="space-y-4">
              {foldersLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-gray-800 h-24 rounded-lg"
                    />
                  ))}
                </div>
              ) : folders && folders.length > 0 ? (
                folders.map((folder) => (
                  <Card
                    key={folder.id}
                    className="bg-gray-900/50 border-gray-800"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                            <Folder className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white">
                                {folder.path}
                              </h3>
                              <Badge
                                variant="secondary"
                                className={
                                  folder.active
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-600 text-white"
                                }
                              >
                                {folder.active ? "Active" : "Inactive"}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-gray-600 text-gray-300"
                              >
                                {folder.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-400">
                              Added:{" "}
                              {new Date(folder.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-white/10"
                            onClick={() => handleToggleFolder(folder)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            {folder.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                            onClick={() => handleDeleteFolder(folder.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No Media Folders
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Add your first media folder to start scanning for content.
                    </p>
                    <AddFolderDialog onSuccess={refetchFolders} />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="conflicts" className="mt-6">
            <div className="flex justify-end mb-6">
              <Button
                onClick={handleDeleteAllConflicts}
                className="bg-red-600 hover:bg-red-700 p-2 mr-4"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete All Conflicts
              </Button>
            </div>
            <div className="space-y-4">
              {conflictsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse bg-gray-800 h-32 rounded-lg"
                    />
                  ))}
                </div>
              ) : conflicts && unresolvedConflicts > 0 ? (
                conflicts
                  .filter((conflict) => !conflict.resolved)
                  .map((conflict) => (
                    <Card
                      key={conflict.id}
                      className="bg-gray-900/50 border-gray-800 border-l-4 border-l-yellow-500"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-5 h-5 text-yellow-400" />
                              <h3 className="font-semibold text-white">
                                Scanning Conflict
                              </h3>
                              <Badge
                                variant="outline"
                                className="border-yellow-600 text-yellow-400"
                              >
                                {conflict.mediaType}
                              </Badge>
                            </div>
                            <div className="space-y-2 mb-4">
                              <div>
                                <div className="text-sm text-gray-400">
                                  File Name
                                </div>
                                <code className="text-sm bg-gray-800 px-2 py-1 rounded text-green-400 break-all">
                                  {conflict.fileName}
                                </code>
                              </div>
                              <div>
                                <div className="text-sm text-gray-400">
                                  File Path
                                </div>
                                <code className="text-sm bg-gray-800 px-2 py-1 rounded text-blue-400 break-all">
                                  {conflict.filePath}
                                </code>
                              </div>
                            </div>
                            <div className="text-sm text-gray-400">
                              Found {conflict.possibleMatches.length} possible
                              matches • Created:{" "}
                              {new Date(
                                conflict.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <ConflictResolutionDialog
                              conflict={conflict}
                              onSuccess={refetchConflicts}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-300 hover:bg-white/10"
                              onClick={() => handleDeleteConflict(conflict.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No Conflicts Found
                    </h3>
                    <p className="text-gray-400">
                      All media files have been successfully processed and
                      matched.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
