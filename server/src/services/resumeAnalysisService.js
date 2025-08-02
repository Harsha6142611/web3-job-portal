const Groq = require('groq-sdk');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

class ResumeAnalysisService {
  constructor() {
    // Initialize Groq AI client (free and fast)
    this.groq = null;
    
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here') {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
      console.log('🔥 Groq AI initialized (free & fast - 14,400 requests/day)');
    } else {
      console.warn('⚠️ GROQ_API_KEY not configured. Using pattern analysis only.');
      console.log('💡 Get your free Groq API key at: https://console.groq.com');
    }
  }

  /**
   * Extract text from PDF or DOC file
   * @param {string} filePath - Path to the uploaded file
   * @param {string} mimeType - MIME type of the file
   * @returns {Promise<string>} Extracted text content
   */
  async extractTextFromFile(filePath, mimeType) {
    try {
      const fileBuffer = await fs.readFile(filePath);

      switch (mimeType) {
        case 'application/pdf':
          const pdfData = await pdf(fileBuffer);
          return pdfData.text;

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          const docData = await mammoth.extractRawText({ buffer: fileBuffer });
          return docData.value;

        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error(`Failed to extract text from file: ${error.message}`);
    }
  }

  /**
   * Analyze resume text using Groq (free and fast)
   * @param {string} resumeText - Extracted text from resume
   * @returns {Promise<Object>} Structured analysis results
   */
  async analyzeResumeWithGroq(resumeText) {
    if (!this.groq) {
      throw new Error('Groq service not configured');
    }

    try {
      const prompt = this.createAnalysisPrompt(resumeText);
      
      // Small delay to be respectful to free tier
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const completion = await this.groq.chat.completions.create({
        model: "llama-3.1-8b-instant", // Fast and supported model
        messages: [
          {
            role: "system",
            content: "You are an expert HR professional and resume analyzer. Extract and structure information from resumes accurately and professionally. Return only valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      });

      const analysisResult = completion.choices[0].message.content;
      return this.parseAIResponse(analysisResult);
    } catch (error) {
      console.error('Groq analysis error:', error);
      throw new Error(`Groq analysis failed: ${error.message}`);
    }
  }



  /**
   * Create comprehensive analysis prompt for AI
   * @param {string} resumeText - Resume text to analyze
   * @returns {string} Formatted prompt for detailed analysis
   */
  createAnalysisPrompt(resumeText) {
    return `You are an expert career coach and resume analyst. Provide a comprehensive analysis of this resume with actionable insights and improvement suggestions.

Resume Text:
${resumeText}

Return ONLY valid JSON with this structure - provide detailed, helpful analysis:
{
  "summary": "Write a comprehensive 5-6 sentence professional summary about this person, highlighting their key experience, skills, strengths, and career focus. Make it personal and specific to their background.",
  "contactInfo": {
    "name": "Full name or null",
    "email": "email address or null", 
    "phone": "phone number or null",
    "location": "city, state or null",
    "linkedin": "linkedin url or null",
    "website": "website url or null"
  },
  "skills": {
    "technical": ["technical skills found"],
    "soft": ["soft skills found"], 
    "tools": ["tools and technologies"],
    "languages": ["programming/spoken languages"],
    "certifications": ["certifications found"]
  },
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "Employment duration", 
      "location": "Work location",
      "description": "Brief description with key achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree and field",
      "institution": "School name",
      "graduationYear": "Year",
      "gpa": "GPA if available"
    }
  ],
  "strengths": [
    "Key strength 1 based on resume content",
    "Key strength 2 based on experience/skills",
    "Key strength 3 based on achievements"
  ],
  "improvements": [
    "Specific actionable improvement suggestion 1",
    "Specific actionable improvement suggestion 2", 
    "Specific actionable improvement suggestion 3"
  ],
  "atsOptimization": {
    "score": 85,
    "missingKeywords": ["keyword1", "keyword2"],
    "suggestions": [
      "Add more industry-specific keywords",
      "Include quantified achievements with numbers",
      "Use standard section headings (Experience, Education, Skills)"
    ]
  },
  "overallScore": {
    "score": 82,
    "breakdown": {
      "content": 85,
      "format": 80, 
      "keywords": 75,
      "experience": 90
    },
    "feedback": "Detailed overall assessment with specific areas to focus on"
  },
  "recommendations": [
    "Priority action item 1 for immediate improvement",
    "Priority action item 2 for skill development",
    "Priority action item 3 for career advancement"
  ],
  "keywords": ["ATS-relevant keywords found in resume"],
  "industryTags": ["relevant industries based on experience"],
  "experienceLevel": "entry|junior|mid|senior|lead|executive",
  "careerPath": {
    "currentLevel": "Assessment of current role level and capabilities",
    "nextSteps": ["Logical next career moves based on experience"],
    "skillGaps": ["Skills to develop for career advancement"]
  }
}

Critical Instructions:
- Return ONLY valid JSON, no other text or explanations
- Provide actionable, specific feedback in all improvement sections
- Give realistic scores based on actual resume content
- Focus on practical suggestions that improve job prospects
- Analyze career progression potential based on experience
- Include both technical and soft skill recommendations
- Consider ATS optimization for better job application success
`;
  }

  /**
   * Parse AI response and validate structure
   * @param {string} aiResponse - Raw AI response
   * @returns {Object} Parsed and validated analysis data
   */
  parseAIResponse(aiResponse) {
    try {
      // Clean the response to extract JSON
      let jsonString = aiResponse.trim();
      
      // Remove any markdown code block formatting
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const analysisData = JSON.parse(jsonString);

      // Validate required fields and provide defaults
      const validatedData = {
        summary: analysisData.summary || 'Professional summary not available',
        contactInfo: {
          name: (analysisData.contactInfo && analysisData.contactInfo.name) || 'Not specified',
          email: (analysisData.contactInfo && analysisData.contactInfo.email) || null,
          phone: (analysisData.contactInfo && analysisData.contactInfo.phone) || null,
          location: (analysisData.contactInfo && analysisData.contactInfo.location) || null,
          linkedin: (analysisData.contactInfo && analysisData.contactInfo.linkedin) || null,
          website: (analysisData.contactInfo && analysisData.contactInfo.website) || null
        },
        skills: {
          technical: Array.isArray(analysisData.skills && analysisData.skills.technical) ? analysisData.skills.technical : [],
          soft: Array.isArray(analysisData.skills && analysisData.skills.soft) ? analysisData.skills.soft : [],
          tools: Array.isArray(analysisData.skills && analysisData.skills.tools) ? analysisData.skills.tools : [],
          languages: Array.isArray(analysisData.skills && analysisData.skills.languages) ? analysisData.skills.languages : [],
          certifications: Array.isArray(analysisData.skills && analysisData.skills.certifications) ? analysisData.skills.certifications : []
        },
        experience: Array.isArray(analysisData.experience) ? analysisData.experience : [],
        education: Array.isArray(analysisData.education) ? analysisData.education : [],
        keywords: Array.isArray(analysisData.keywords) ? analysisData.keywords : [],
        industryTags: Array.isArray(analysisData.industryTags) ? analysisData.industryTags : [],
        experienceLevel: this.validateExperienceLevel(analysisData.experienceLevel),
        analysisScore: parseFloat(analysisData.analysisScore) || 0.5
      };

      return validatedData;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw response:', aiResponse);
      
      // Return fallback structure if parsing fails
      return this.createFallbackAnalysis();
    }
  }

  /**
   * Validate experience level value
   * @param {string} level - Experience level from AI
   * @returns {string} Valid experience level
   */
  validateExperienceLevel(level) {
    const validLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];
    return validLevels.includes(level) ? level : 'mid';
  }

  /**
   * Create enhanced fallback analysis using text patterns
   * @param {string} text - Extracted resume text
   * @returns {Object} Enhanced analysis structure
   */
  createEnhancedFallback(text = '') {
    const analysis = this.createFallbackAnalysis();
    
    if (!text) return analysis;

    try {
      // Basic text analysis patterns
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]{10,}/);
      const linkedinMatch = text.match(/linkedin\.com\/in\/[\w\-]+/i);
      
      // Common skill patterns
      const techSkills = this.extractSkillsFromText(text);
      const nameMatch = this.extractNameFromText(text);
      const experienceLevel = this.detectExperienceLevel(text);
      const industries = this.detectIndustryFromText(text);
      
      // Generate intelligent feedback based on text analysis
      const improvements = this.generateTextBasedImprovements(text, techSkills);
      const strengths = this.generateTextBasedStrengths(text, techSkills);
      
      return {
        summary: this.generateDetailedSummary(text, techSkills, industries, experienceLevel),
        contactInfo: {
          name: nameMatch || 'Not specified',
          email: emailMatch ? emailMatch[0] : null,
          phone: phoneMatch ? phoneMatch[0].trim() : null,
          location: null,
          linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : null,
          website: null
        },
        skills: {
          technical: techSkills.technical,
          soft: techSkills.soft,
          tools: techSkills.tools,
          languages: techSkills.languages,
          certifications: []
        },
        experience: [],
        education: [],
        strengths: strengths,
        improvements: improvements,
        atsOptimization: {
          score: techSkills.all.length > 5 ? 70 : 50,
          missingKeywords: this.suggestMissingKeywords(industries),
          suggestions: [
            "Add more quantified achievements with numbers",
            "Include industry-specific keywords",
            "Use action verbs to start bullet points"
          ]
        },
        overallScore: {
          score: this.calculateTextBasedScore(text, techSkills),
          breakdown: {
            content: techSkills.all.length > 3 ? 75 : 60,
            format: 70,
            keywords: techSkills.all.length > 5 ? 80 : 50,
            experience: text.length > 1000 ? 75 : 60
          },
          feedback: "Resume analyzed using advanced text patterns. Consider AI analysis for more detailed insights."
        },
        recommendations: [
          "Add specific achievements with measurable results",
          "Include more industry-relevant keywords",
          "Consider AI-powered analysis for detailed feedback"
        ],
        keywords: techSkills.all,
        industryTags: industries,
        experienceLevel: experienceLevel,
        careerPath: {
          currentLevel: this.assessCurrentLevel(text, experienceLevel),
          nextSteps: this.suggestNextSteps(experienceLevel, industries),
          skillGaps: this.identifySkillGaps(industries, techSkills)
        },
        analysisScore: 0.7
      };
    } catch (error) {
      console.log('Enhanced fallback failed, using basic fallback');
      return this.createFallbackAnalysis();
    }
  }

  /**
   * Create fallback analysis when AI fails
   * @returns {Object} Basic analysis structure with helpful guidance
   */
  createFallbackAnalysis() {
    return {
      summary: 'Resume uploaded and processed successfully with smart pattern analysis.',
      contactInfo: {
        name: 'Not specified',
        email: null,
        phone: null,
        location: null,
        linkedin: null,
        website: null
      },
      skills: {
        technical: [],
        soft: [],
        tools: [],
        languages: [],
        certifications: []
      },
      experience: [],
      education: [],
      strengths: [
        "Resume successfully uploaded and parsed",
        "Text content extracted and processed",
        "Basic skills and patterns detected"
      ],
      improvements: [
        "Add Groq API key for AI-powered detailed analysis",
        "Include more specific technical skills",
        "Add quantified achievements with numbers",
        "Ensure contact information is clearly visible"
      ],
      atsOptimization: {
        score: 45,
        missingKeywords: ["relevant", "industry", "keywords"],
        suggestions: [
          "Add industry-specific terminology",
          "Include relevant technical skills",
          "Use standard resume section headers",
          "Add quantified achievements"
        ]
      },
      overallScore: {
        score: 50,
        breakdown: {
          content: 45,
          format: 55,
          keywords: 40,
          experience: 50
        },
        feedback: "Smart pattern analysis completed. Add Groq API key for comprehensive AI analysis."
      },
      recommendations: [
        "Get free Groq API key for detailed AI analysis",
        "Add specific technical skills relevant to your field",
        "Include quantified achievements (e.g., 'Increased sales by 25%')",
        "Use action verbs to start bullet points"
      ],
      keywords: [],
      industryTags: [],
      experienceLevel: 'mid',
      careerPath: {
        currentLevel: "Pattern-based level assessment - limited without AI",
        nextSteps: ["Get Groq API key for detailed career guidance"],
        skillGaps: ["AI analysis required for detailed skill gap assessment"]
      },
      analysisScore: 0.5
    };
  }

  /**
   * Extract skills from text using pattern matching
   * @param {string} text - Resume text
   * @returns {Object} Categorized skills
   */
  extractSkillsFromText(text) {
    const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'php', 'c++', 'c#', 'swift', 'kotlin', 'go', 'rust', 'typescript', 'vue', 'angular'];
    const toolKeywords = ['git', 'docker', 'aws', 'azure', 'mongodb', 'postgresql', 'mysql', 'jenkins', 'kubernetes', 'figma', 'photoshop', 'illustrator'];
    const softKeywords = ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative', 'management', 'planning'];
    
    const lowerText = text.toLowerCase();
    
    return {
      technical: techKeywords.filter(skill => lowerText.includes(skill)),
      tools: toolKeywords.filter(tool => lowerText.includes(tool)),
      soft: softKeywords.filter(skill => lowerText.includes(skill)),
      languages: techKeywords.filter(lang => lowerText.includes(lang)),
      all: [...techKeywords, ...toolKeywords].filter(skill => lowerText.includes(skill))
    };
  }

  /**
   * Extract name from resume text
   * @param {string} text - Resume text
   * @returns {string|null} Extracted name
   */
  extractNameFromText(text) {
    // Simple name extraction - first line that looks like a name
    const lines = text.split('\n').slice(0, 5); // Check first 5 lines
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length > 3 && cleanLine.length < 50 && /^[A-Za-z\s]+$/.test(cleanLine)) {
        return cleanLine;
      }
    }
    return null;
  }

  /**
   * Detect industry from text
   * @param {string} text - Resume text
   * @returns {Array} Industry tags
   */
  detectIndustryFromText(text) {
    const industries = {
      'technology': ['software', 'developer', 'engineer', 'programmer', 'tech', 'it'],
      'design': ['designer', 'ui', 'ux', 'graphic', 'creative'],
      'marketing': ['marketing', 'seo', 'social media', 'advertising'],
      'finance': ['finance', 'accounting', 'banking', 'investment'],
      'healthcare': ['healthcare', 'medical', 'nurse', 'doctor'],
      'education': ['teacher', 'education', 'training', 'academic']
    };
    
    const lowerText = text.toLowerCase();
    const detected = [];
    
    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        detected.push(industry);
      }
    }
    
    return detected;
  }

  /**
   * Detect experience level from text
   * @param {string} text - Resume text
   * @returns {string} Experience level
   */
  detectExperienceLevel(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('senior') || lowerText.includes('lead')) return 'senior';
    if (lowerText.includes('junior') || lowerText.includes('entry')) return 'junior';
    if (lowerText.includes('intern') || lowerText.includes('student')) return 'entry';
    if (lowerText.includes('manager') || lowerText.includes('director')) return 'lead';
    
    return 'mid';
  }

  /**
   * Main method to process resume file
   * @param {string} filePath - Path to uploaded file
   * @param {string} mimeType - File MIME type
   * @returns {Promise<Object>} Complete analysis results
   */
  async processResume(filePath, mimeType) {
    let extractedText = '';
    let analysisData = null;
    let processingStatus = 'completed';
    let processingError = null;

    try {
      console.log(`🔍 Starting resume analysis for: ${path.basename(filePath)}`);
      
      // Step 1: Extract text (this should always work)
      try {
        extractedText = await this.extractTextFromFile(filePath, mimeType);
        
        if (!extractedText || extractedText.trim().length < 50) {
          throw new Error('Insufficient text content extracted from resume');
        }

        console.log(`📄 Extracted ${extractedText.length} characters of text`);
      } catch (textError) {
        console.error('Text extraction failed:', textError);
        throw textError; // Text extraction is critical, fail completely if this doesn't work
      }

      // Step 2: Try Groq AI analysis or use pattern analysis
      if (this.groq) {
        try {
          console.log('🔥 Starting AI analysis with Groq (free & fast)');
          analysisData = await this.analyzeResumeWithGroq(extractedText);
          console.log('✅ AI analysis completed successfully with Groq');
        } catch (aiError) {
          console.log('❌ Groq AI analysis failed:', aiError.message);
          console.log('🔄 Falling back to smart pattern analysis...');
          analysisData = this.createEnhancedFallback(extractedText);
          processingError = `Groq AI failed: ${aiError.message}. Using smart pattern analysis instead.`;
        }
      } else {
        console.log('📝 Using smart pattern analysis (Groq AI not configured)');
        analysisData = this.createEnhancedFallback(extractedText);
        processingError = null; // Don't show error for basic analysis - it's a valid mode
      }

      console.log('✅ Resume processing completed with all available methods');

      return {
        extractedText,
        analysisData,
        processingStatus,
        processingError
      };

    } catch (error) {
      console.error('Critical resume processing error:', error);
      return {
        extractedText,
        analysisData: this.createFallbackAnalysis(),
        processingStatus: 'failed',
        processingError: error.message
      };
    }
  }
  /**
   * Generate detailed summary based on text analysis
   * @param {string} text - Resume text
   * @param {Object} techSkills - Extracted skills
   * @param {Array} industries - Detected industries
   * @param {string} experienceLevel - Experience level
   * @returns {string} Detailed summary
   */
  generateDetailedSummary(text, techSkills, industries, experienceLevel) {
    const name = this.extractNameFromText(text) || "This professional";
    const skillCount = techSkills.all.length;
    const primaryIndustry = industries.length > 0 ? industries[0] : 'technology';
    
    let summary = `${name} is a ${experienceLevel}-level professional with expertise in ${primaryIndustry}. `;
    
    if (skillCount > 5) {
      summary += `They demonstrate proficiency across ${skillCount} technical areas, including ${techSkills.technical.slice(0, 3).join(', ')}. `;
    } else if (skillCount > 0) {
      summary += `They have experience with ${techSkills.all.join(', ')}. `;
    }
    
    if (techSkills.tools.length > 0) {
      summary += `Their toolkit includes modern tools like ${techSkills.tools.slice(0, 2).join(' and ')}. `;
    }
    
    if (text.length > 1500) {
      summary += `Their comprehensive background shows substantial hands-on experience. `;
    }
    
    // Add experience level context
    const levelDescriptions = {
      'entry': 'They are building foundational skills and eager to contribute to dynamic teams.',
      'junior': 'They are developing specialized expertise and taking on increasing responsibilities.',
      'mid': 'They bring proven problem-solving abilities and project delivery experience.',
      'senior': 'They offer leadership capabilities and deep technical expertise.',
      'lead': 'They provide strategic thinking and mentorship to drive team success.'
    };
    
    summary += levelDescriptions[experienceLevel] || 'They bring valuable experience and skills to any organization.';
    
    return summary;
  }

  /**
   * Generate text-based improvement suggestions
   * @param {string} text - Resume text
   * @param {Object} techSkills - Extracted skills
   * @returns {Array} Improvement suggestions
   */
  generateTextBasedImprovements(text, techSkills) {
    const suggestions = [];
    
    // Check for quantified achievements
    const hasNumbers = /\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?/i.test(text);
    if (!hasNumbers) {
      suggestions.push("Add quantified achievements with specific numbers (e.g., 'Increased sales by 25%')");
    }
    
    // Check for action verbs
    const actionVerbs = ['managed', 'led', 'developed', 'created', 'implemented', 'improved', 'achieved'];
    const hasActionVerbs = actionVerbs.some(verb => text.toLowerCase().includes(verb));
    if (!hasActionVerbs) {
      suggestions.push("Start bullet points with strong action verbs (managed, led, developed, implemented)");
    }
    
    // Check for skills quantity
    if (techSkills.all.length < 5) {
      suggestions.push("Include more relevant technical skills and tools");
    }
    
    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Generate text-based strengths
   * @param {string} text - Resume text
   * @param {Object} techSkills - Extracted skills
   * @returns {Array} Identified strengths
   */
  generateTextBasedStrengths(text, techSkills) {
    const strengths = [];
    
    if (techSkills.technical.length > 3) {
      strengths.push("Strong technical skill set with diverse technologies");
    }
    
    if (text.length > 1500) {
      strengths.push("Comprehensive work experience and detailed background");
    }
    
    if (techSkills.tools.length > 2) {
      strengths.push("Proficient with multiple industry-standard tools");
    }
    
    // Fallback strengths
    if (strengths.length === 0) {
      strengths.push("Resume successfully processed and analyzed");
      strengths.push("Clear presentation of professional information");
    }
    
    return strengths.slice(0, 3);
  }

  /**
   * Suggest missing keywords based on industry
   * @param {Array} industries - Detected industries
   * @returns {Array} Suggested keywords
   */
  suggestMissingKeywords(industries) {
    const keywordMap = {
      'technology': ['agile', 'scrum', 'ci/cd', 'api', 'database'],
      'design': ['user experience', 'wireframing', 'prototyping', 'brand'],
      'marketing': ['analytics', 'conversion', 'campaign', 'roi'],
      'finance': ['financial analysis', 'budgeting', 'forecasting', 'risk']
    };
    
    const suggestions = [];
    industries.forEach(industry => {
      if (keywordMap[industry]) {
        suggestions.push(...keywordMap[industry]);
      }
    });
    
    return suggestions.length > 0 ? suggestions.slice(0, 4) : ['leadership', 'teamwork', 'communication'];
  }

  /**
   * Calculate text-based score
   * @param {string} text - Resume text
   * @param {Object} techSkills - Extracted skills
   * @returns {number} Calculated score
   */
  calculateTextBasedScore(text, techSkills) {
    let score = 50; // Base score
    
    // Length bonus
    if (text.length > 1000) score += 10;
    if (text.length > 2000) score += 5;
    
    // Skills bonus
    score += Math.min(techSkills.all.length * 2, 20);
    
    // Contact info bonus
    if (text.includes('@')) score += 5;
    if (text.includes('linkedin')) score += 5;
    
    return Math.min(score, 85); // Cap at 85 for text analysis
  }

  /**
   * Assess current career level
   * @param {string} text - Resume text
   * @param {string} experienceLevel - Detected level
   * @returns {string} Assessment
   */
  assessCurrentLevel(text, experienceLevel) {
    const levelDescriptions = {
      'entry': 'Beginning career with foundational skills',
      'junior': 'Early career professional building experience',
      'mid': 'Experienced professional with proven track record',
      'senior': 'Senior professional with leadership experience',
      'lead': 'Leadership role with strategic responsibilities'
    };
    
    return levelDescriptions[experienceLevel] || 'Professional with industry experience';
  }

  /**
   * Suggest next career steps
   * @param {string} experienceLevel - Current level
   * @param {Array} industries - Industries
   * @returns {Array} Next steps
   */
  suggestNextSteps(experienceLevel, industries) {
    const stepMap = {
      'entry': ['Gain specialized skills', 'Seek mentorship opportunities', 'Build portfolio projects'],
      'junior': ['Take on larger projects', 'Develop leadership skills', 'Pursue certifications'],
      'mid': ['Lead team initiatives', 'Mentor junior staff', 'Consider management track'],
      'senior': ['Strategic planning roles', 'Cross-functional leadership', 'Industry expertise'],
      'lead': ['Executive positions', 'Board opportunities', 'Thought leadership']
    };
    
    return stepMap[experienceLevel] || ['Continue professional development', 'Expand network', 'Seek new challenges'];
  }

  /**
   * Identify skill gaps
   * @param {Array} industries - Industries
   * @param {Object} techSkills - Current skills
   * @returns {Array} Skill gaps
   */
  identifySkillGaps(industries, techSkills) {
    const industrySkills = {
      'technology': ['cloud computing', 'microservices', 'devops', 'ai/ml'],
      'design': ['user research', 'accessibility', 'design systems', 'animation'],
      'marketing': ['data analytics', 'automation', 'social media', 'content strategy'],
      'finance': ['financial modeling', 'risk assessment', 'compliance', 'fintech']
    };
    
    const gaps = [];
    industries.forEach(industry => {
      if (industrySkills[industry]) {
        industrySkills[industry].forEach(skill => {
          if (!techSkills.all.some(existing => existing.toLowerCase().includes(skill.toLowerCase()))) {
            gaps.push(skill);
          }
        });
      }
    });
    
    return gaps.length > 0 ? gaps.slice(0, 3) : ['Communication skills', 'Project management', 'Data analysis'];
  }
}

module.exports = new ResumeAnalysisService();