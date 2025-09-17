import { Slider } from '@/components/ui/slider'
import { useState } from 'react'

export default function TestSlider() {
  const [value, setValue] = useState<[number, number]>([100, 1000])

  return (
    <div className="p-10">
      <Slider
        value={value}
        onValueChange={(v) => setValue(v as [number, number])}
        min={0}
        max={5000}
        step={50}
        className="w-96"
      />
      <pre>{JSON.stringify(value)}</pre>
    </div>
  )
}
