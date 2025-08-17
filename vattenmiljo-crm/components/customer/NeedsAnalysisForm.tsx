'use client'

import React, { useState, useEffect } from 'react'
import { Customer, NeedsAnalysis } from '@/lib/types'
import { FormGroup, FormLabel, FormError } from '@/components/ui/form'
import { 
  Droplets, 
  TestTube, 
  AlertTriangle, 
  CheckCircle2,
  Eye,
  Zap,
  Home,
  Heart
} from 'lucide-react'

interface NeedsAnalysisFormProps {
  customer: Customer
  onCustomerChange: (customer: Customer) => void
  onValidationChange?: (isValid: boolean) => void
}

interface AnalysisValidationErrors {
  general?: string
}

export default function NeedsAnalysisForm({ 
  customer, 
  onCustomerChange, 
  onValidationChange 
}: NeedsAnalysisFormProps) {
  const [errors, setErrors] = useState<AnalysisValidationErrors>({})
  
  // Initialize needs analysis if it doesn't exist
  const needsAnalysis = customer.needsAnalysis || {}

  // Water quality questions - standardized for Swedish water analysis
  const waterQualityQuestions = [
    {
      id: 'waterHardness',
      label: 'Vattenhårdhet',
      description: 'Hur är vattenhårdheten i ditt hem?',
      icon: Droplets,
      type: 'radio' as const,
      options: [
        { value: 'soft', label: 'Mjukt vatten (0-7 °dH)', description: 'Inga kalkproblem' },
        { value: 'medium', label: 'Medelhårt vatten (7-14 °dH)', description: 'Vissa kalkproblem' },
        { value: 'hard', label: 'Hårt vatten (14-21 °dH)', description: 'Märkbara kalkproblem' },
        { value: 'very_hard', label: 'Mycket hårt vatten (>21 °dH)', description: 'Stora kalkproblem' }
      ]
    },
    {
      id: 'chlorineTaste',
      label: 'Klorsmak/-lukt',
      description: 'Känner du klor i vattnet?',
      icon: TestTube,
      type: 'boolean' as const
    },
    {
      id: 'ironStaining',
      label: 'Järnfläckar',
      description: 'Får du järnfläckar på porslin och textilier?',
      icon: AlertTriangle,
      type: 'boolean' as const
    },
    {
      id: 'limescaleProblems',
      label: 'Kalkavlagringar',
      description: 'Har du problem med kalkavlagringar på kranar och duschar?',
      icon: Home,
      type: 'boolean' as const
    },
    {
      id: 'skinIrritation',
      label: 'Hudproblem',
      description: 'Får du torrhet eller irritation av vattnet?',
      icon: Heart,
      type: 'boolean' as const
    },
    {
      id: 'cloudyWater',
      label: 'Grumligt vatten',
      description: 'Är vattnet ibland grumligt eller missfärgat?',
      icon: Eye,
      type: 'boolean' as const
    },
    {
      id: 'highWaterBills',
      label: 'Höga vattenräkningar',
      description: 'Tycker du att vattenräkningarna är höga?',
      icon: Zap,
      type: 'boolean' as const
    }
  ]

  // Usage pattern questions
  const usageQuestions = [
    {
      id: 'householdSize',
      label: 'Hushållsstorlek',
      description: 'Hur många personer bor i hushållet?',
      type: 'select' as const,
      options: [
        { value: '1', label: '1 person' },
        { value: '2', label: '2 personer' },
        { value: '3', label: '3 personer' },
        { value: '4', label: '4 personer' },
        { value: '5+', label: '5+ personer' }
      ]
    },
    {
      id: 'waterUsage',
      label: 'Vattenanvändning per år',
      description: 'Ungefär hur många kubikmeter vatten använder ni per år?',
      type: 'select' as const,
      options: [
        { value: 'low', label: 'Låg (<100 m³/år)' },
        { value: 'medium', label: 'Normal (100-200 m³/år)' },
        { value: 'high', label: 'Hög (200-300 m³/år)' },
        { value: 'very_high', label: 'Mycket hög (>300 m³/år)' }
      ]
    },
    {
      id: 'propertyType',
      label: 'Fastighetstyp',
      description: 'Vilken typ av boende har ni?',
      type: 'select' as const,
      options: [
        { value: 'apartment', label: 'Lägenhet' },
        { value: 'house', label: 'Villa/Radhus' },
        { value: 'farm', label: 'Lantbruk/Gård' },
        { value: 'commercial', label: 'Kommersiell fastighet' }
      ]
    }
  ]

  // Priority assessment based on answers
  const calculatePriority = (analysis: NeedsAnalysis): 'low' | 'medium' | 'high' => {
    let score = 0
    
    // High priority indicators
    if (analysis.waterHardness === 'very_hard') score += 3
    if (analysis.waterHardness === 'hard') score += 2
    if (analysis.ironStaining) score += 2
    if (analysis.skinIrritation) score += 2
    if (analysis.limescaleProblems) score += 2
    
    // Medium priority indicators
    if (analysis.chlorineTaste) score += 1
    if (analysis.cloudyWater) score += 1
    if (analysis.highWaterBills) score += 1
    if (analysis.householdSize === '5+') score += 1
    if (analysis.waterUsage === 'high' || analysis.waterUsage === 'very_high') score += 1
    
    if (score >= 5) return 'high'
    if (score >= 2) return 'medium'
    return 'low'
  }

  // Update needs analysis and recalculate priority
  const updateNeedsAnalysis = (field: keyof NeedsAnalysis, value: any) => {
    const updatedAnalysis = { ...needsAnalysis, [field]: value }
    const newPriority = calculatePriority(updatedAnalysis)
    
    const updatedCustomer = { 
      ...customer, 
      needsAnalysis: updatedAnalysis,
      priority: newPriority
    }
    
    onCustomerChange(updatedCustomer)
  }

  // Validation
  useEffect(() => {
    const newErrors: AnalysisValidationErrors = {}
    
    // Basic validation - no strict requirements for needs analysis
    // Could add validation for required fields in the future
    
    setErrors(newErrors)
    
    if (onValidationChange) {
      onValidationChange(Object.keys(newErrors).length === 0)
    }
  }, [customer.needsAnalysis, onValidationChange])

  const renderQuestion = (question: any) => {
    const currentValue = needsAnalysis[question.id as keyof NeedsAnalysis]

    switch (question.type) {
      case 'boolean':
        return (
          <FormGroup key={question.id}>
            <div className="flex items-start space-x-3">
              <question.icon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <FormLabel className="text-base font-medium text-gray-900">
                  {question.label}
                </FormLabel>
                <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value="true"
                      checked={currentValue === true}
                      onChange={() => updateNeedsAnalysis(question.id, true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ja</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name={question.id}
                      value="false"
                      checked={currentValue === false}
                      onChange={() => updateNeedsAnalysis(question.id, false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Nej</span>
                  </label>
                  {currentValue !== undefined && (
                    <button
                      type="button"
                      onClick={() => updateNeedsAnalysis(question.id, undefined)}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Rensa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </FormGroup>
        )
      
      case 'radio':
        return (
          <FormGroup key={question.id}>
            <div className="flex items-start space-x-3">
              <question.icon className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <FormLabel className="text-base font-medium text-gray-900">
                  {question.label}
                </FormLabel>
                <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                
                <div className="space-y-2">
                  {question.options.map((option: any) => (
                    <label key={option.value} className="flex items-start">
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={currentValue === option.value}
                        onChange={() => updateNeedsAnalysis(question.id, option.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                      />
                      <div className="ml-3">
                        <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                        {option.description && (
                          <p className="text-xs text-gray-500">{option.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                  {currentValue && (
                    <button
                      type="button"
                      onClick={() => updateNeedsAnalysis(question.id, undefined)}
                      className="text-xs text-gray-500 hover:text-gray-700 underline ml-7"
                    >
                      Rensa val
                    </button>
                  )}
                </div>
              </div>
            </div>
          </FormGroup>
        )
      
      case 'select':
        return (
          <FormGroup key={question.id}>
            <FormLabel className="text-base font-medium text-gray-900">
              {question.label}
            </FormLabel>
            <p className="text-sm text-gray-600 mb-3">{question.description}</p>
            <select
              value={currentValue || ''}
              onChange={(e) => updateNeedsAnalysis(question.id, e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Välj alternativ...</option>
              {question.options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormGroup>
        )
      
      default:
        return null
    }
  }

  // Calculate analysis summary
  const getAnalysisSummary = () => {
    const issues = []
    
    if (needsAnalysis.waterHardness === 'hard' || needsAnalysis.waterHardness === 'very_hard') {
      issues.push('Hårt vatten')
    }
    if (needsAnalysis.chlorineTaste) issues.push('Klorsmak')
    if (needsAnalysis.ironStaining) issues.push('Järnfläckar')
    if (needsAnalysis.limescaleProblems) issues.push('Kalkproblem')
    if (needsAnalysis.skinIrritation) issues.push('Hudproblem')
    if (needsAnalysis.cloudyWater) issues.push('Grumligt vatten')
    
    return issues
  }

  const analysisSummary = getAnalysisSummary()
  const recommendedPriority = calculatePriority(needsAnalysis)

  return (
    <div className="space-y-8">
      {/* Analysis Summary */}
      {analysisSummary.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Identifierade behov</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysisSummary.map((issue, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm font-medium"
              >
                {issue}
              </span>
            ))}
          </div>
          <div className="mt-3 text-sm text-blue-700">
            <strong>Rekommenderad prioritet:</strong> 
            <span className={`ml-2 px-2 py-1 rounded-md text-xs font-medium ${
              recommendedPriority === 'high' ? 'bg-red-100 text-red-800' :
              recommendedPriority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {recommendedPriority === 'high' ? 'Hög' : 
               recommendedPriority === 'medium' ? 'Medium' : 'Låg'}
            </span>
          </div>
        </div>
      )}

      {/* Water Quality Questions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TestTube className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Vattenkvalitet</h3>
        </div>
        
        <div className="space-y-6">
          {waterQualityQuestions.map(renderQuestion)}
        </div>
      </div>

      {/* Usage Pattern Questions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Home className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Användningsmönster</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usageQuestions.map(renderQuestion)}
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Ytterligare kommentarer</h3>
        </div>
        
        <FormGroup>
          <FormLabel>Specifika problem eller önskemål</FormLabel>
          <textarea
            value={needsAnalysis.notes || ''}
            onChange={(e) => updateNeedsAnalysis('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Beskriv eventuella specifika problem med vattnet eller särskilda önskemål kunden har..."
          />
        </FormGroup>
      </div>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-red-900">Korrigera följande fel:</h3>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {Object.values(errors).map((error, index) => (
              <li key={index} className="text-sm text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}