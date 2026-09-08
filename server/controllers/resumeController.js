import imagekit from "../configs/imagekit.js";
import Resume from "../models/Resume.js";
// importing filesystem (fs)
import fs from 'fs'

// controller for creating a new resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
	try {
    const userId = req.userId // from middleware
    const {title} = req.body

    // create new resume
    const newResume = await Resume.create({userId, title})
    // return success message
    return res.status(201).json({message: "Resume created successfully", resume: newResume })
	} catch (error) {
		return res.status(400).json({ message: error.message })
	}
}

// controller fore deleting a resume
// DELETE: /api/resumes/delete
export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId
    const {resumeId } = req.params

    await Resume.findOneAndDelete({userId, _id: resumeId})
    
    // return success message
    return res
			.status(200)
			.json({ message: 'Resume deleted successfully'})
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
  try {
    const userId = req.userId
    const {resumeId} = req.params
  
    const resume = await Resume.findOne({userId, _id: resumeId})

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" })
    }

    // updating system props (mongoose) before sending to user
    resume.__v = undefined
    resume.createdAt = undefined
    resume.updatedAt = undefined

    if (typeof resume.skills === 'string') {
      resume.skills = resume.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(Boolean)
    }

    return res.status(200).json({resume})
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

// get resume by id public
// GET: /api/resumes/public
export const getPublicResumeById = async (req, res) => {
  try {
    const {resumeId} = req.params
    const resume = await Resume.findOne({public: true, _id: resumeId})
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' })
    }

    return res.status(200).json({ resume })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

// controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
  try {
    const userId = req.userId
    const {resumeId, resumeData, removeBackground} = req.body
    const image = req.file

    let resumeDataCopy

    if (typeof resumeData === 'string') {
      resumeDataCopy = await JSON.parse(resumeData)
    } else {
      resumeDataCopy = structuredClone(resumeData)
    }

    delete resumeDataCopy._id
    delete resumeDataCopy.userId
    delete resumeDataCopy.createdAt
    delete resumeDataCopy.updatedAt
    delete resumeDataCopy.__v

    if (image) {

      const imageBufferData = fs.createReadStream(image.path)

      const response = await imagekit.files.upload({
				file: imageBufferData,
				fileName: `resume-${resumeId}-${Date.now()}.jpg`,
				folder: 'user-resumes',
				transformation: {
					pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : ''),
				},
			})

      const transformation = 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
      const transformedImageUrl = response.url.replace('/user-resumes/', `/tr:${transformation}/user-resumes/`)

      resumeDataCopy.personal_info.image = transformedImageUrl // live url of uploaded image
    }

    const resume = await Resume.findOneAndUpdate({userId, _id: resumeId}, {$set: resumeDataCopy}, {new: true})

    return res.status(200).json({message: "Saved successfully", resume})
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}
