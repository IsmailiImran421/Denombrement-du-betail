<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reclamation extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_plainte';

    protected $fillable = [
        'sujet',
        'description',
        'date_plainte',
        'id_eleveur',
        'resolue',
        'reponse',
        'statut',
    ];

    protected $casts = [
        'date_plainte' => 'datetime',
    ];

    public function eleveur(): BelongsTo
    {
        return $this->belongsTo(Eleveur::class, 'id_eleveur', 'id_eleveur');
    }
}
