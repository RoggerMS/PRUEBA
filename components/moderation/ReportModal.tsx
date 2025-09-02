'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useModeration } from '@/hooks/useModeration';
import { AlertTriangle, Flag, Upload, X } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'user' | 'post' | 'comment' | 'message' | 'conversation';
  targetId: string;
  targetData?: {
    title?: string;
    content?: string;
    author?: {
      name: string;
      username: string;
    };
  };
}

const REPORT_REASONS = {
  spam: {
    label: 'Spam',
    description: 'Unwanted or repetitive content'
  },
  harassment: {
    label: 'Harassment',
    description: 'Bullying, intimidation, or targeted abuse'
  },
  hate_speech: {
    label: 'Hate Speech',
    description: 'Content that promotes hatred based on identity'
  },
  violence: {
    label: 'Violence',
    description: 'Threats or promotion of violence'
  },
  sexual_content: {
    label: 'Sexual Content',
    description: 'Inappropriate sexual or adult content'
  },
  misinformation: {
    label: 'Misinformation',
    description: 'False or misleading information'
  },
  copyright: {
    label: 'Copyright Violation',
    description: 'Unauthorized use of copyrighted material'
  },
  privacy: {
    label: 'Privacy Violation',
    description: 'Sharing private information without consent'
  },
  impersonation: {
    label: 'Impersonation',
    description: 'Pretending to be someone else'
  },
  other: {
    label: 'Other',
    description: 'Other violation not listed above'
  }
};

export default function ReportModal({ isOpen, onClose, targetType, targetId, targetData }: ReportModalProps) {
  const { createReport, loading } = useModeration();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(false);
  const [blockUser, setBlockUser] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    try {
      await createReport({
        type: targetType,
        targetId,
        reason: selectedReason,
        description: description.trim(),
        evidence: evidence.length > 0 ? evidence : undefined
      });

      // Reset form
      setSelectedReason('');
      setDescription('');
      setEvidence([]);
      setAnonymous(false);
      setBlockUser(false);
      
      onClose();
      toast.success('Report submitted successfully. Our team will review it shortly.');
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleEvidenceAdd = (url: string) => {
    if (url.trim() && !evidence.includes(url.trim())) {
      setEvidence(prev => [...prev, url.trim()]);
    }
  };

  const handleEvidenceRemove = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const getTargetTypeLabel = () => {
    switch (targetType) {
      case 'user': return 'User';
      case 'post': return 'Post';
      case 'comment': return 'Comment';
      case 'message': return 'Message';
      case 'conversation': return 'Conversation';
      default: return 'Content';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5 text-red-500" />
            <span>Report {getTargetTypeLabel()}</span>
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate content or behavior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Target Information */}
          {targetData && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Reporting: {getTargetTypeLabel()}
              </p>
              {targetData.author && (
                <p className="text-sm text-gray-600">
                  By: {targetData.author.name} (@{targetData.author.username})
                </p>
              )}
              {targetData.title && (
                <p className="text-sm text-gray-600 mt-1">
                  Title: {targetData.title}
                </p>
              )}
              {targetData.content && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  Content: {targetData.content}
                </p>
              )}
            </div>
          )}

          {/* Reason Selection */}
          <div>
            <Label htmlFor="reason">Reason for reporting *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_REASONS).map(([key, reason]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{reason.label}</div>
                      <div className="text-xs text-gray-500">{reason.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about why you're reporting this content..."
              className="min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          {/* Evidence URLs */}
          <div>
            <Label>Evidence (optional)</Label>
            <p className="text-xs text-gray-500 mb-2">
              Add URLs to screenshots or other evidence that supports your report
            </p>
            <div className="space-y-2">
              {evidence.map((url, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                  <span className="text-sm flex-1 truncate">{url}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEvidenceRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="url"
                  placeholder="https://example.com/evidence"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEvidenceAdd((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                    if (input) {
                      handleEvidenceAdd(input.value);
                      input.value = '';
                    }
                  }}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={anonymous}
                onCheckedChange={(checked) => setAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous" className="text-sm">
                Submit report anonymously
              </Label>
            </div>
            
            {targetType === 'user' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="blockUser"
                  checked={blockUser}
                  onCheckedChange={(checked) => setBlockUser(checked as boolean)}
                />
                <Label htmlFor="blockUser" className="text-sm">
                  Block this user after reporting
                </Label>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="text-xs space-y-1">
                  <li>• False reports may result in action against your account</li>
                  <li>• Reports are reviewed by our moderation team</li>
                  <li>• You may be contacted for additional information</li>
                  <li>• Urgent safety concerns should be reported to local authorities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedReason || !description.trim()}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}