import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import sponsorService from '@/services/sponsorService';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';

const Sponsor = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { userProfile } = useUser();
  const { toast } = useToast();

  // Get user ID from multiple sources
  const getUserId = () => {
    return (
      userProfile?.id ||
      userProfile?.user_id ||
      localStorage.getItem('userId') ||
      Cookies.get('userId') ||
      'demo-user-id'
    );
  };
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    const userId = getUserId();

    if (!userId || !isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [submissionsData, analyticsData] = await Promise.all([
        sponsorService.getMySubmissions(userId),
        sponsorService.getAnalytics(userId),
      ]);

      setSubmissions(submissionsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading sponsor data:', error);
      if (toast) {
        toast({
          title: 'Error',
          description: 'Failed to load your sponsor data.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/dashboard/sponsor/create');
  };

  const handleEdit = submissionId => {
    navigate(`/dashboard/sponsor/edit/${submissionId}`);
  };

  const handleDelete = async submissionId => {
    if (!confirm('Are you sure you want to delete this ad submission?')) return;

    try {
      await sponsorService.deleteSubmission(submissionId);
      toast({
        title: 'Success',
        description: 'Ad submission deleted successfully.',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete ad submission.',
        variant: 'destructive',
      });
    }
  };

  const handlePayment = async submission => {
    try {
      const paymentData = await sponsorService.initiatePayment(
        submission.id,
        submission.tier
      );
      navigate(paymentData.paymentUrl);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initiate payment.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = status => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending Review' },
      approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rejected' },
      active: { variant: 'default', icon: PlayCircle, label: 'Active' },
      paused: { variant: 'secondary', icon: PauseCircle, label: 'Paused' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon size={14} />
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = paymentStatus => {
    return paymentStatus === 'paid' ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle size={14} className="mr-1" />
        Paid
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock size={14} className="mr-1" />
        Unpaid
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              Please log in to access the Sponsor portal.
            </p>
            <Button onClick={() => navigate('/login')} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sponsor Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Request ads and view your campaign performance
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2" size={20} />
          Request New Ad
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && analytics.activeAds > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Ads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {analytics.activeAds}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Impressions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.totalImpressions.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {analytics.totalClicks.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average CTR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {analytics.ctr}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Ad Requests</CardTitle>
          <CardDescription>
            View and manage all your ad requests and active campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No ad requests yet
              </h3>
              <p className="text-gray-600 mb-6">
                Request your first ad campaign to reach thousands of learners
              </p>
              <Button
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2" size={20} />
                Request Your First Ad
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map(submission => (
                <Card
                  key={submission.id}
                  className="border-2 hover:border-blue-200 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left Section - Ad Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {submission.mediaUrl &&
                            submission.mediaType === 'image' && (
                              <img
                                src={submission.mediaUrl}
                                alt={submission.title}
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                            )}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {submission.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {submission.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {getStatusBadge(submission.status)}
                              {getPaymentBadge(submission.paymentStatus)}
                              <Badge variant="outline">
                                {submission.tier || 'No Tier'}
                              </Badge>
                              <Badge variant="outline">
                                {submission.mediaType || 'text'}
                              </Badge>
                            </div>
                            {submission.status === 'active' && (
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span>
                                  <Eye size={14} className="inline mr-1" />
                                  {submission.impressions || 0} views
                                </span>
                                <span>
                                  <TrendingUp
                                    size={14}
                                    className="inline mr-1"
                                  />
                                  {submission.clicks || 0} clicks
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col gap-2 md:w-48">
                        {/* Show Pay button only if approved and unpaid */}
                        {submission.status === 'approved' &&
                          submission.paymentStatus === 'unpaid' && (
                            <Button
                              onClick={() => handlePayment(submission)}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <CreditCard className="mr-2" size={16} />
                              Pay Now
                            </Button>
                          )}

                        {/* Show edit button only for pending requests */}
                        {submission.status === 'pending' &&
                          submission.paymentStatus === 'unpaid' && (
                            <Button
                              variant="outline"
                              onClick={() => handleEdit(submission.id)}
                              className="w-full"
                            >
                              <Edit className="mr-2" size={16} />
                              Edit Request
                            </Button>
                          )}

                        {/* Show delete for pending or rejected */}
                        {(submission.status === 'pending' ||
                          submission.status === 'rejected') && (
                          <Button
                            variant="outline"
                            onClick={() => handleDelete(submission.id)}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="mr-2" size={16} />
                            Delete
                          </Button>
                        )}

                        {/* Show message for pending approval */}
                        {submission.status === 'pending' && (
                          <div className="text-xs text-gray-600 text-center py-2">
                            Waiting for admin approval
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            How it works
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>Request an Ad:</strong> Fill in your ad details with
              requirements (image, video, or banner)
            </li>
            <li>
              <strong>Choose a Plan:</strong> Select a pricing tier based on
              placement and reach
            </li>
            <li>
              <strong>Submit for Review:</strong> Your request goes to admin for
              review (typically 24-48 hours)
            </li>
            <li>
              <strong>Admin Approval:</strong> Admin reviews and
              approves/rejects your request
            </li>
            <li>
              <strong>Payment:</strong> Once approved, complete payment for your
              selected tier
            </li>
            <li>
              <strong>Go Live:</strong> After payment, your ad goes live and
              starts reaching learners
            </li>
            <li>
              <strong>Track Performance:</strong> Monitor impressions, clicks,
              and ROI through real-time analytics
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sponsor;
