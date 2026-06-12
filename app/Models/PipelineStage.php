<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PipelineStage extends Model
{
    protected $fillable = ['name', 'order', 'color'];

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }
}
