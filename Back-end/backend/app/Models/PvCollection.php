<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PvCollection extends Model
{
    use HasFactory;

    protected $table = 'pv_collections';
    protected $primaryKey = 'id_rapport';
    public $incrementing = false;

    protected $fillable = [
        'id_rapport',
        'total_animaux',
        'total_moutons_males',
        'total_moutons_femmelles',
        'total_vaches_males',
        'total_vaches_femmelles',
        'total_chevres_males',
        'total_chevres_femmelles',
        'total_chamelles_males',
        'total_chamelles_femmelles',
        'valide',
    ];

    protected $casts = [
        'valide' => 'boolean',
    ];

    public function pvInscription(): BelongsTo
    {
        return $this->belongsTo(PvInscription::class, 'id_rapport', 'id_rapport');
    }
}
