"use client"

import { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { createReview } from "@/app/_actions/create-review"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { StarIcon } from "lucide-react"

interface ReviewFormProps {
  barbershopId: string
}

const ReviewForm = ({ barbershopId }: ReviewFormProps) => {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await createReview({
        barbershopId,
        rating,
        comment,
      })
      toast.success("Avaliação enviada com sucesso!")
      setComment("")
      router.refresh()
    } catch (error) {
      toast.error("Erro ao enviar avaliação.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-5">
      <h3 className="font-bold">Qualificar esta Barbearia</h3>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">Nota (1 a 5):</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            className={`p-1 ${rating >= star ? "fill-primary text-primary" : "text-gray-300"}`}
          >
            <StarIcon
              size={20}
              className={rating >= star ? "fill-primary" : ""}
            />
          </button>
        ))}
      </div>
      <div>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Deixe seu comentário ou feedback..."
        />
      </div>
      <Button type="submit" disabled={loading} size="sm">
        {loading ? "Enviando..." : "Enviar Avaliação"}
      </Button>
    </form>
  )
}

export default ReviewForm
