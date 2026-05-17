<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PvInscription extends Model
{
    use HasFactory;

    protected $table = 'pv_inscriptions';
    protected $primaryKey = 'id_rapport';

    protected $fillable = [
        'date_generation',
        'id_comite',
        'id_eleveur',
    ];

    protected $casts = [
        'date_generation' => 'datetime',
    ];

    public function comite(): BelongsTo
    {
        return $this->belongsTo(Comite::class, 'id_comite', 'id_comite');
    }

    public function eleveur(): BelongsTo
    {
        return $this->belongsTo(Eleveur::class, 'id_eleveur', 'id_eleveur');
    }

    public function pvCollection(): HasOne
    {
        return $this->hasOne(PvCollection::class, 'id_rapport', 'id_rapport');
    }

    public function pvBouclage(): HasOne
    {
        return $this->hasOne(PvBouclage::class, 'id_rapport', 'id_rapport');
    }
}
