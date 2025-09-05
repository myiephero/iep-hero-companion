// Intelligent Standards Alignment Analysis Engine
// Real NLP-based goal analysis and standards matching

import { 
  Standard, 
  AlignmentResult, 
  StandardMatch, 
  ALL_STANDARDS, 
  STATE_SPECIFIC_STANDARDS 
} from './standards-database';

export class StandardsAnalyzer {
  
  /**
   * Analyze IEP goal text and find matching educational standards
   */
  async analyzeGoalAlignment(
    goalText: string, 
    selectedState: string = 'national',
    selectedSubject: string = 'all',
    gradeLevel?: string
  ): Promise<AlignmentResult> {
    
    // Clean and prepare goal text for analysis
    const cleanGoalText = this.preprocessGoalText(goalText);
    const goalKeywords = this.extractKeywords(cleanGoalText);
    
    // Get relevant standards based on filters
    const relevantStandards = this.getRelevantStandards(selectedState, selectedSubject, gradeLevel);
    
    // Find matches using multiple analysis techniques
    const matches = await this.findStandardsMatches(cleanGoalText, goalKeywords, relevantStandards);
    
    // Sort and categorize matches
    const sortedMatches = matches.sort((a, b) => b.score - a.score);
    
    const primaryStandards = sortedMatches.filter(match => match.score >= 0.7).slice(0, 5);
    const secondaryStandards = sortedMatches.filter(match => match.score >= 0.4 && match.score < 0.7).slice(0, 3);
    
    // Calculate overall alignment score
    const overallScore = this.calculateOverallScore(primaryStandards, secondaryStandards);
    
    // Generate detailed recommendations
    const recommendations = this.generateRecommendations(goalText, primaryStandards, secondaryStandards, overallScore);
    
    // Calculate confidence level
    const confidence = this.calculateConfidence(primaryStandards, goalKeywords);
    
    return {
      primaryStandards,
      secondaryStandards,
      overallScore,
      recommendations,
      confidence
    };
  }
  
  /**
   * Preprocess goal text for analysis
   */
  private preprocessGoalText(goalText: string): string {
    return goalText
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  /**
   * Extract meaningful keywords from goal text using NLP techniques
   */
  private extractKeywords(goalText: string): string[] {
    // Common stop words to filter out
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 
      'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 
      'will', 'with', 'when', 'given', 'student', 'year', 'iep', 'end', 'across',
      'consecutive', 'trials', 'assessments', 'weekly', 'monthly', 'daily'
    ]);
    
    // Extract words and filter
    const words = goalText.split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    // Add important educational phrases
    const educationalPhrases = this.extractEducationalPhrases(goalText);
    
    return [...words, ...educationalPhrases];
  }
  
  /**
   * Extract important educational phrases and concepts
   */
  private extractEducationalPhrases(goalText: string): string[] {
    const phrases = [];
    
    // Academic skill phrases
    const academicPatterns = [
      /reading comprehension/gi,
      /word problems/gi,
      /fine motor/gi,
      /gross motor/gi,
      /social skills/gi,
      /communication skills/gi,
      /behavior management/gi,
      /phonics/gi,
      /fluency/gi,
      /vocabulary/gi,
      /multiplication/gi,
      /division/gi,
      /fractions/gi,
      /problem solving/gi,
      /critical thinking/gi,
      /oral expression/gi,
      /written expression/gi,
      /listening comprehension/gi
    ];
    
    academicPatterns.forEach(pattern => {
      const matches = goalText.match(pattern);
      if (matches) {
        phrases.push(...matches.map(match => match.toLowerCase()));
      }
    });
    
    return phrases;
  }
  
  /**
   * Get relevant standards based on filters
   */
  private getRelevantStandards(state: string, subject: string, gradeLevel?: string): Standard[] {
    let standards = [...ALL_STANDARDS];
    
    // Add state-specific standards if available
    if (state !== 'national' && STATE_SPECIFIC_STANDARDS[state]) {
      standards = [...standards, ...STATE_SPECIFIC_STANDARDS[state]];
    }
    
    // Filter by subject
    if (subject !== 'all') {
      standards = standards.filter(standard => standard.subject === subject);
    }
    
    // Filter by grade level (with flexibility for nearby grades)
    if (gradeLevel) {
      standards = standards.filter(standard => this.isRelevantGrade(standard.grade, gradeLevel));
    }
    
    return standards;
  }
  
  /**
   * Check if a standard's grade level is relevant to the target grade
   */
  private isRelevantGrade(standardGrade: string, targetGrade: string): boolean {
    // Handle grade ranges like "K-2", "3-5"
    if (standardGrade.includes('-')) {
      const [start, end] = standardGrade.split('-');
      const targetNum = this.gradeToNumber(targetGrade);
      const startNum = this.gradeToNumber(start);
      const endNum = this.gradeToNumber(end);
      return targetNum >= startNum && targetNum <= endNum;
    }
    
    // Exact match or within 1 grade level
    const standardNum = this.gradeToNumber(standardGrade);
    const targetNum = this.gradeToNumber(targetGrade);
    
    return Math.abs(standardNum - targetNum) <= 1;
  }
  
  /**
   * Convert grade strings to numbers for comparison
   */
  private gradeToNumber(grade: string): number {
    if (grade.toLowerCase() === 'k' || grade.toLowerCase() === 'kindergarten') return 0;
    if (grade.toLowerCase() === 'pre-k') return -1;
    return parseInt(grade) || 0;
  }
  
  /**
   * Find matching standards using multiple analysis techniques
   */
  private async findStandardsMatches(
    goalText: string, 
    goalKeywords: string[], 
    standards: Standard[]
  ): Promise<StandardMatch[]> {
    
    const matches: StandardMatch[] = [];
    
    for (const standard of standards) {
      const match = this.calculateStandardMatch(goalText, goalKeywords, standard);
      if (match.score > 0.2) { // Only include meaningful matches
        matches.push(match);
      }
    }
    
    return matches;
  }
  
  /**
   * Calculate how well a standard matches the goal using multiple factors
   */
  private calculateStandardMatch(goalText: string, goalKeywords: string[], standard: Standard): StandardMatch {
    let totalScore = 0;
    const matchedKeywords: string[] = [];
    const scoringFactors: string[] = [];
    
    // 1. Direct keyword matching (40% weight)
    const keywordScore = this.calculateKeywordMatch(goalKeywords, standard.keywords, matchedKeywords);
    totalScore += keywordScore * 0.4;
    if (keywordScore > 0) scoringFactors.push("keyword match");
    
    // 2. Semantic similarity (30% weight)
    const semanticScore = this.calculateSemanticSimilarity(goalText, standard.description);
    totalScore += semanticScore * 0.3;
    if (semanticScore > 0.3) scoringFactors.push("semantic similarity");
    
    // 3. Academic domain relevance (20% weight)
    const domainScore = this.calculateDomainRelevance(goalText, standard);
    totalScore += domainScore * 0.2;
    if (domainScore > 0.3) scoringFactors.push("domain relevance");
    
    // 4. Educational verbs and actions (10% weight)
    const actionScore = this.calculateActionMatch(goalText, standard.description);
    totalScore += actionScore * 0.1;
    if (actionScore > 0.3) scoringFactors.push("action alignment");
    
    // Generate reasoning
    const reasoning = this.generateMatchReasoning(standard, matchedKeywords, scoringFactors, totalScore);
    
    return {
      standard,
      score: Math.min(totalScore, 1.0), // Cap at 1.0
      matchedKeywords,
      reasoning
    };
  }
  
  /**
   * Calculate keyword matching score
   */
  private calculateKeywordMatch(goalKeywords: string[], standardKeywords: string[], matchedKeywords: string[]): number {
    let matches = 0;
    
    for (const goalKeyword of goalKeywords) {
      for (const standardKeyword of standardKeywords) {
        if (this.isKeywordMatch(goalKeyword, standardKeyword)) {
          matches++;
          matchedKeywords.push(standardKeyword);
          break; // Avoid double counting
        }
      }
    }
    
    return matches / Math.max(goalKeywords.length, standardKeywords.length);
  }
  
  /**
   * Check if two keywords match (with fuzzy matching)
   */
  private isKeywordMatch(goalKeyword: string, standardKeyword: string): boolean {
    // Exact match
    if (goalKeyword === standardKeyword) return true;
    
    // Partial match
    if (goalKeyword.includes(standardKeyword) || standardKeyword.includes(goalKeyword)) return true;
    
    // Stemming-like matching (simple approach)
    const goalRoot = this.getWordRoot(goalKeyword);
    const standardRoot = this.getWordRoot(standardKeyword);
    
    return goalRoot === standardRoot;
  }
  
  /**
   * Simple word root extraction (basic stemming)
   */
  private getWordRoot(word: string): string {
    // Remove common suffixes
    return word
      .replace(/ing$/, '')
      .replace(/ed$/, '')
      .replace(/s$/, '')
      .replace(/ly$/, '')
      .replace(/tion$/, '')
      .replace(/ness$/, '');
  }
  
  /**
   * Calculate semantic similarity using simple text analysis
   */
  private calculateSemanticSimilarity(goalText: string, standardText: string): number {
    const goalWords = new Set(goalText.split(/\s+/));
    const standardWords = new Set(standardText.toLowerCase().split(/\s+/));
    
    // Calculate Jaccard similarity
    const intersection = new Set([...goalWords].filter(x => standardWords.has(x)));
    const union = new Set([...goalWords, ...standardWords]);
    
    return intersection.size / union.size;
  }
  
  /**
   * Calculate domain relevance
   */
  private calculateDomainRelevance(goalText: string, standard: Standard): number {
    const domainKeywords = {
      'Reading Literature': ['read', 'story', 'character', 'plot', 'literature', 'fiction'],
      'Reading Foundational Skills': ['phonics', 'decoding', 'fluency', 'sight words', 'letters'],
      'Writing': ['write', 'compose', 'essay', 'paragraph', 'sentence', 'grammar'],
      'Speaking and Listening': ['speak', 'listen', 'discussion', 'presentation', 'oral'],
      'Operations and Algebraic Thinking': ['add', 'subtract', 'multiply', 'divide', 'equation'],
      'Number and Operations in Base Ten': ['place value', 'hundreds', 'tens', 'ones', 'digits'],
      'Measurement and Data': ['measure', 'length', 'weight', 'time', 'data', 'graph'],
      'Life Science': ['living', 'plants', 'animals', 'habitat', 'survival'],
      'Physical Science': ['force', 'motion', 'energy', 'matter', 'sound', 'light'],
      'Earth Science': ['weather', 'rocks', 'soil', 'water', 'environment'],
      'Engineering Design': ['design', 'build', 'solve', 'problem', 'solution'],
    };
    
    const relevantKeywords = domainKeywords[standard.domain || ''] || [];
    let matches = 0;
    
    for (const keyword of relevantKeywords) {
      if (goalText.includes(keyword)) {
        matches++;
      }
    }
    
    return matches / Math.max(relevantKeywords.length, 1);
  }
  
  /**
   * Calculate action/verb alignment
   */
  private calculateActionMatch(goalText: string, standardText: string): number {
    const educationalVerbs = [
      'identify', 'describe', 'explain', 'analyze', 'compare', 'contrast',
      'solve', 'calculate', 'measure', 'count', 'read', 'write',
      'demonstrate', 'use', 'apply', 'create', 'construct', 'design'
    ];
    
    let goalVerbs = 0;
    let standardVerbs = 0;
    let matchingVerbs = 0;
    
    for (const verb of educationalVerbs) {
      const inGoal = goalText.includes(verb);
      const inStandard = standardText.toLowerCase().includes(verb);
      
      if (inGoal) goalVerbs++;
      if (inStandard) standardVerbs++;
      if (inGoal && inStandard) matchingVerbs++;
    }
    
    if (goalVerbs === 0 && standardVerbs === 0) return 0;
    return matchingVerbs / Math.max(goalVerbs, standardVerbs);
  }
  
  /**
   * Generate human-readable reasoning for the match
   */
  private generateMatchReasoning(
    standard: Standard, 
    matchedKeywords: string[], 
    scoringFactors: string[], 
    score: number
  ): string {
    let reasoning = `This goal aligns with ${standard.code}`;
    
    if (matchedKeywords.length > 0) {
      reasoning += ` based on shared concepts: ${matchedKeywords.slice(0, 3).join(', ')}`;
    }
    
    if (scoringFactors.length > 0) {
      reasoning += `. Strong alignment factors: ${scoringFactors.join(', ')}`;
    }
    
    if (score >= 0.8) {
      reasoning += '. Excellent alignment with high confidence.';
    } else if (score >= 0.6) {
      reasoning += '. Good alignment with moderate confidence.';
    } else if (score >= 0.4) {
      reasoning += '. Partial alignment - consider as supporting standard.';
    } else {
      reasoning += '. Weak alignment - may be tangentially related.';
    }
    
    return reasoning;
  }
  
  /**
   * Calculate overall alignment score
   */
  private calculateOverallScore(primaryStandards: StandardMatch[], secondaryStandards: StandardMatch[]): number {
    if (primaryStandards.length === 0 && secondaryStandards.length === 0) return 0;
    
    const primaryScore = primaryStandards.reduce((sum, match) => sum + match.score, 0) / Math.max(primaryStandards.length, 1);
    const secondaryScore = secondaryStandards.reduce((sum, match) => sum + match.score, 0) / Math.max(secondaryStandards.length, 1);
    
    // Weight primary alignments more heavily
    return (primaryScore * 0.8 + secondaryScore * 0.2) * 100;
  }
  
  /**
   * Calculate confidence in the alignment analysis
   */
  private calculateConfidence(primaryStandards: StandardMatch[], goalKeywords: string[]): number {
    if (primaryStandards.length === 0) return 0;
    
    const avgScore = primaryStandards.reduce((sum, match) => sum + match.score, 0) / primaryStandards.length;
    const keywordCoverage = primaryStandards[0]?.matchedKeywords.length / Math.max(goalKeywords.length, 1);
    
    return Math.min((avgScore + keywordCoverage) / 2, 1.0);
  }
  
  /**
   * Generate detailed recommendations based on analysis
   */
  private generateRecommendations(
    goalText: string, 
    primaryStandards: StandardMatch[], 
    secondaryStandards: StandardMatch[], 
    overallScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    // Overall alignment assessment
    if (overallScore >= 80) {
      recommendations.push('Excellent standards alignment! This goal strongly supports grade-level expectations.');
    } else if (overallScore >= 60) {
      recommendations.push('Good standards alignment with room for refinement to better target specific standards.');
    } else if (overallScore >= 40) {
      recommendations.push('Partial standards alignment. Consider revising to more directly address target standards.');
    } else {
      recommendations.push('Limited standards alignment. Goal may need significant revision to meet educational standards.');
    }
    
    // Specific improvement suggestions
    if (primaryStandards.length === 0) {
      recommendations.push('Consider adding specific academic skills or learning objectives that align with grade-level standards.');
    }
    
    // Check for measurability
    if (!goalText.includes('%') && !goalText.includes('accuracy') && !goalText.includes('out of')) {
      recommendations.push('Add specific measurement criteria (e.g., "with 80% accuracy") to improve goal measurability.');
    }
    
    // Check for timeframe
    if (!goalText.includes('by the end') && !goalText.includes('within') && !goalText.includes('iep year')) {
      recommendations.push('Include a specific timeframe (e.g., "by the end of the IEP year") for goal completion.');
    }
    
    // Domain-specific recommendations
    if (primaryStandards.length > 0) {
      const primaryDomain = primaryStandards[0].standard.domain;
      if (primaryDomain === 'Reading Literature' || primaryDomain === 'Reading Foundational Skills') {
        recommendations.push('Consider specifying the type and complexity of reading materials for grade-level appropriateness.');
      } else if (primaryDomain === 'Operations and Algebraic Thinking') {
        recommendations.push('Ensure problem types and number ranges align with grade-level mathematical expectations.');
      } else if (primaryDomain === 'Writing') {
        recommendations.push('Specify writing genres, length requirements, and quality criteria that match grade-level standards.');
      }
    }
    
    // Multiple standards support
    if (primaryStandards.length > 1) {
      recommendations.push(`Goal effectively supports multiple standards (${primaryStandards.length} primary alignments) - excellent comprehensive approach.`);
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const standardsAnalyzer = new StandardsAnalyzer();