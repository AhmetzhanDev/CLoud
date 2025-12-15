import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '@/services/analysisApi';
import type { ResearchDirection } from '@shared/types/researchDirection';

interface ResearchDirectionsProps {
  articleIds: string[];
}

export default function ResearchDirections({ articleIds }: ResearchDirectionsProps) {
  const queryClient = useQueryClient();
  const [selectedDirection, setSelectedDirection] = useState<ResearchDirection | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch or get cached directions
  const { data: directions, isLoading, error } = useQuery({
    queryKey: ['research-directions', articleIds.sort().join(',')],
    queryFn: () => analysisApi.generateDirections(articleIds),
    enabled: articleIds.length > 0,
    retry: false,
  });

  // Generate directions mutation
  const generateDirectionsMutation = useMutation({
    mutationFn: () => analysisApi.generateDirections(articleIds),
    onSuccess: (data: ResearchDirection[]) => {
      queryClient.setQueryData(['research-directions', articleIds.sort().join(',')], data);
    },
  });

  // Save direction mutation
  const saveDirectionMutation = useMutation({
    mutationFn: (directionId: string) => analysisApi.saveDirection(directionId),
    onSuccess: () => {
      // Could show a success message or update UI
    },
  });

  const handleViewDetails = (direction: ResearchDirection) => {
    setSelectedDirection(direction);
    setShowDetailModal(true);
  };

  const handleSaveDirection = (directionId: string) => {
    saveDirectionMutation.mutate(directionId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    if (score >= 0.4) return 'Low';
    return 'Very Low';
  };

  // Loading state
  if (isLoading || generateDirectionsMutation.isPending) {
    return (
      <div className="card">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">
            {generateDirectionsMutation.isPending ? 'Generating research directions...' : 'Loading directions...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Analyzing articles to suggest research paths</p>
        </div>
      </div>
    );
  }

  // No directions available
  if (error || !directions || directions.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Research Directions Available</h3>
          <p className="text-gray-600 mb-6">
            {articleIds.length === 0
              ? 'Select at least one article to generate research direction suggestions.'
              : 'Generate AI-powered research direction suggestions based on your selected articles.'}
          </p>
          {articleIds.length > 0 && (
            <>
              <button
                onClick={() => generateDirectionsMutation.mutate()}
                disabled={generateDirectionsMutation.isPending}
                className="btn btn-primary"
              >
                Generate Directions
              </button>
              {generateDirectionsMutation.isError && (
                <p className="text-red-600 text-sm mt-4">
                  Failed to generate directions. Please try again.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Display directions
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Research Directions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Based on {articleIds.length} article{articleIds.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => generateDirectionsMutation.mutate()}
          disabled={generateDirectionsMutation.isPending}
          className="btn btn-secondary"
        >
          Regenerate
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {directions
          .sort((a, b) => (b.relevanceScore + b.noveltyScore) - (a.relevanceScore + a.noveltyScore))
          .map((direction, index) => (
            <div key={direction.id} className="card hover:shadow-lg transition-shadow">
              {/* Header with ranking */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{direction.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{direction.description}</p>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Relevance:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(direction.relevanceScore)}`}>
                    {getScoreLabel(direction.relevanceScore)} ({Math.round(direction.relevanceScore * 100)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Novelty:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(direction.noveltyScore)}`}>
                    {getScoreLabel(direction.noveltyScore)} ({Math.round(direction.noveltyScore * 100)}%)
                  </span>
                </div>
              </div>

              {/* Research Questions Preview */}
              {direction.researchQuestions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Research Questions:</h4>
                  <ul className="space-y-1">
                    {direction.researchQuestions.slice(0, 2).map((question, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-indigo-600 mt-1">•</span>
                        <span>{question}</span>
                      </li>
                    ))}
                    {direction.researchQuestions.length > 2 && (
                      <li className="text-sm text-gray-500 italic">
                        +{direction.researchQuestions.length - 2} more question{direction.researchQuestions.length - 2 !== 1 ? 's' : ''}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(direction)}
                  className="btn btn-secondary flex-1"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleSaveDirection(direction.id)}
                  disabled={saveDirectionMutation.isPending}
                  className="btn btn-primary flex-1"
                >
                  {saveDirectionMutation.isPending ? 'Saving...' : 'Save Direction'}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDirection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">{selectedDirection.title}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 leading-relaxed">{selectedDirection.description}</p>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Relevance Score</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${selectedDirection.relevanceScore * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(selectedDirection.relevanceScore * 100)}%
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">Novelty Score</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${selectedDirection.noveltyScore * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(selectedDirection.noveltyScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Research Questions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Research Questions</h4>
                <ul className="space-y-3">
                  {selectedDirection.researchQuestions.map((question, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-indigo-50 rounded-lg p-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 flex-1">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Methodology */}
              {selectedDirection.methodology && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Methodology</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2">Data Collection</h5>
                      <p className="text-sm text-gray-700">{selectedDirection.methodology.dataCollection}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2">Preprocessing</h5>
                      <p className="text-sm text-gray-700">{selectedDirection.methodology.preprocessing}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2">Methods</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {selectedDirection.methodology.methods.map((method, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{method}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2">Evaluation</h5>
                      <p className="text-sm text-gray-700">{selectedDirection.methodology.evaluation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pipeline */}
              {selectedDirection.pipeline && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Research Pipeline</h4>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{selectedDirection.pipeline}</p>
                  </div>
                </div>
              )}

              {/* Rationale */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Rationale</h4>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{selectedDirection.rationale}</p>
                </div>
              </div>

              {/* Risks & Limitations */}
              {(selectedDirection.risks || selectedDirection.limitations) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDirection.risks && selectedDirection.risks.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Risks</h4>
                      <ul className="space-y-2">
                        {selectedDirection.risks.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedDirection.limitations && selectedDirection.limitations.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Limitations</h4>
                      <ul className="space-y-2">
                        {selectedDirection.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-orange-500 mt-0.5">⚡</span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Future Work */}
              {selectedDirection.futureWork && selectedDirection.futureWork.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Future Improvements</h4>
                  <ul className="space-y-2">
                    {selectedDirection.futureWork.map((work, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 rounded-lg p-3">
                        <span className="text-green-600 mt-0.5">💡</span>
                        <span>{work}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key References */}
              {selectedDirection.keyReferences && selectedDirection.keyReferences.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Key References</h4>
                  <ul className="space-y-2">
                    {selectedDirection.keyReferences.map((reference, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-indigo-600 font-medium">[{idx + 1}]</span>
                        <span>{reference}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metadata */}
              <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
                Based on {selectedDirection.articleIds.length} article{selectedDirection.articleIds.length !== 1 ? 's' : ''} • 
                Generated on {new Date(selectedDirection.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSaveDirection(selectedDirection.id);
                    setShowDetailModal(false);
                  }}
                  disabled={saveDirectionMutation.isPending}
                  className="btn btn-primary flex-1"
                >
                  Save This Direction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {saveDirectionMutation.isSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          Direction saved successfully!
        </div>
      )}
    </div>
  );
}
